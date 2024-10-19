---
layout: default
---

[home](/)

# Integrating Nextcloud and Mailcow

Nextcloud cannot handle emails by itslef, but you can make it work along with a different system,
given the correct configuration.

I'll lay out a simple (yet frustrating-to-get-wrong) layout.

## Prerequisites

* Nextcloud instance (Recommended: [Nextcloud AIO](https://github.com/nextcloud/all-in-one))

* Mailcow instance (Recommended: [Mailcow: dockerized](https://docs.mailcow.email/getstarted/install/))

* Mailcow's SMTP port must be reacable from Nextcloud (e.g. through the address **mail.example.com:587**)

## Set up

First - come up with an email address that Nextcloud will use (e.g. **nextcloud@example.com**).

### Mailcow - administrator

Connect to Mailcow as the **administrator account**, and do one of the following:

Option 1: Create a mailbox
(**E-Mail** -> **Configuration** -> **Mailboxes** -> **Add mailbox** -> **nextcloud**)

Option 2: Create an alias to an existing mailbox
(**E-Mail** -> **Configuration** -> **Aliases** -> **Add alias**)
* Alias address: **nextcloud@example.com**
* Goto addres: **existing-mailbox-address@example.com**

### Mailcow - mailbox owner

Connect to Mailcow as the **mailbox owner**, and set up an app password.
(**App passwords** -> **Create app password**)

### Nextcloud - administrator

Connect to Nextcloud as the administrator. (**Administration settings** -> **Basic settings** -> **Email server**)
* Send mode: **SMTP**
* Encryption: **None/STARTTLS**
* From address: **nextcloud@example.com**
* Server address: **mailcow.server.address:587**
* Authentication: **Checked**
* Credentials: **mailbox owner** \| **App password from previous step**

If you created a new mailbox - the credentials username should be equal to **From address**.

If you created an alias - the credentials username is mailbox owner (e.g. **existing-mailbox-address@example.com**)

### Test it out

In Nextcloud - click **Send email** and cross your fingers.

Good luck with the setup!

[home](/) \| [up](#)
