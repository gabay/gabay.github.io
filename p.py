import dataclasses
import re
from typing import Iterable, Self

import requests

HEADER = "#EXTM3U"

ISRAEL_URLS = [
    "https://iptv-org.github.io/iptv/countries/il.m3u",  # IPTV, country = israel
    # "https://iptv-org.github.io/iptv/languages/heb.m3u",  # IPTV, language = hebrew
    "https://raw.githubusercontent.com/Free-TV/IPTV/refs/heads/master/playlists/playlist_israel.m3u8",  # FreeTV, Israel
]

ROMANIA_URLS = [
    "https://iptv-org.github.io/iptv/countries/ro.m3u",  # IPTV, country = Romania
    # "https://iptv-org.github.io/iptv/languages/ron.m3u",  # IPTV, language = Romanian
    "https://raw.githubusercontent.com/Free-TV/IPTV/refs/heads/master/playlists/playlist_romania.m3u8",  # FreeTV, Romania
]

# EVERYTHING_URLS = [
#     # "https://iptv-org.github.io/iptv/index.m3u",  # IPTV, everything
#     # "https://raw.githubusercontent.com/Free-TV/IPTV/master/playlist.m3u8",  # FreeTV, everything
# ]


@dataclasses.dataclass
class Channel:
    tvg_id: str | None
    tvg_logo: str | None
    group_title: str | None
    name: str
    extention_and_url: str

    @classmethod
    def from_str(cls, string: str) -> Self:
        header, extention_and_url = string.strip().split("\n", 1)
        tvg_id = tvg_logo = group_title = None
        if match := re.search(f'tvg-id="(.*?)" ', header):
            tvg_id = match.group(1).split("@")[0].strip()
        if match := re.search(f'tvg-logo="(.*?)" ', header):
            tvg_logo = match.group(1).strip()
        if match := re.search(f'tvggroup-title="(.*?)" ', header):
            group_title = match.group(1).strip()
        if match := re.search(f'tvg-name="(.*?)" ', header):
            name = match.group(1).strip()
        else:
            name = header.rsplit(",", 1)[1].strip()

        return cls(tvg_id, tvg_logo, group_title, name, extention_and_url)

    def to_str(self) -> str:
        header = f'#EXTINF:-1 tvg-id="{self.tvg_id}" tvg-logo="{self.tvg_logo}" tvg-name="{self.name}" group-title="{self.group_title}",{self.name}'
        return "\n".join([header, self.extention_and_url])

    def should_keep(self) -> bool:
        all_fields_present = bool(
            self.tvg_id
            and self.tvg_logo
            and self.group_title
            and self.name
            and self.extention_and_url
        )
        is_youtube = "youtube.com" in self.extention_and_url
        is_trash = self.group_title == "Israel" and "14" in self.name
        return all_fields_present and not is_youtube and not is_trash


def main():
    channels = []

    for url in ISRAEL_URLS:
        channels += get_channels(url, "Israel")

    for url in ROMANIA_URLS:
        channels += get_channels(url, "Romania")

    # save
    with open("p.m3u", "w") as out:
        out.write(HEADER)
        for channel in sorted(channels, key=lambda c: c.tvg_id):
            out.write("\n")
            out.write(channel.to_str())


def get_channels(url: str, group: str) -> Iterable[Channel]:
    data = requests.get(url).text
    data = "".join(re.findall(r"[\x00-\x7f]+", data))
    for chunk in data.split("#EXTINF:-1 ")[1:]:
        channel = Channel.from_str(chunk)
        channel.group_title = group
        if channel.should_keep():
            yield channel


if __name__ == "__main__":
    main()
