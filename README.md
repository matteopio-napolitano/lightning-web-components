# Salesforce Lightning Web Component [![CircleCI](https://circleci.com/gh/matteopio-napolitano/lightning-web-components/tree/master.svg?style=svg)](https://circleci.com/gh/matteopio-napolitano/lightning-web-components/tree/master)

This is a Salesforce sample application created with SFDX where it's showed up the implementation of some basic Lightning Web Component.

Lightning Web Components uses core Web Components standards and provides only what’s necessary to perform well in browsers supported by Salesforce. Because it’s built on code that runs natively in browsers, Lightning Web Components is lightweight and delivers exceptional performance. Most of the code you write is standard JavaScript and HTML.

Read more in the [Official Documentation](https://developer.salesforce.com/docs/component-library/documentation/lwc)

# Continuous Integration and Continuous Delivery

This project holds Continuous Integration and Continuous Delivery capabilities over CircleCI. If you're interested in how to setup all this stuff, you can read more below and use the .circleci/config.yml as a reference.

Continuous integration (CI) environments are fully automated and don’t support the human interactivity of a web-based flow. In these environments, you must use the JSON web tokens (JWT) to authorize an org.

The JWT-based authorization flow requires first generating a digital certificate and creating a connected app. You execute these tasks only once. After that, you can authorize the org in a script that runs in your CI environment.

## Create a Private Key and Self-Signed Digital Certificate

This process produces two files.

`server.key` — The private key. You specify this file when you authorize an org with the `force:auth:jwt:grant` command.

`server.crt` — The digital certification. You upload this file when you create the connected app required by the JWT-based flow.

1. Generate a private key, and store it in a file called server.key. At the end, you can delete the `server.pass.key` file because you no longer need it.

```
openssl genrsa -des3 -passout pass:x -out server.pass.key 2048
```
```
openssl rsa -passin pass:x -in server.pass.key -out server.key
```


2. Generate a certificate signing request using the `server.key` file. Store the certificate signing request in a file called `server.csr`. Enter information about your company when prompted.

```
openssl req -new -key server.key -out server.csr
```

3. Generate a self-signed digital certificate from the `server.key` and `server.csr` files. Store the certificate in a file called `server.crt`.

```
openssl x509 -req -sha256 -days 365 -in server.csr -signkey server.key -out server.crt
```

## Create a Connected App
If you use JWT-based authorization, you must create your own connected app in your Dev Hub org.

1. Log in to your Dev Hub org.
2. From Setup, enter `App Manager` in the Quick Find box to get to the Lightning Experience App Manager.
3. In the top-right corner, click **New Connected App**.
4. Update the basic information as needed, such as the connected app name and your email address.
5. Select **Enable OAuth Settings**.
6. For the callback URL, enter `http://localhost:1717/OauthRedirect`. If port 1717 (the default) is already in use on your local machine, specify an available one instead. Make sure to also update your `sfdx-project.json` file by setting the `oauthLocalPort` property to the new port. For example, if you set the callback URL to `http://localhost:1919/OauthRedirect`:
```
"oauthLocalPort" : "1919"
```
7. (JWT only) Select **Use digital signatures**.
8. (JWT only) Click **Choose File** and upload the `server.crt` file that contains your digital certificate.
9. Add these OAuth scopes:
    - **Access and manage your data (api)**
    - **Perform requests on your behalf at any time (refresh_token, offline_access)**
    - **Provide access to your data via the Web (web)**
10. Click **Save**.
11. (JWT only) Click **Manage**.
12. (JWT only) Click **Edit Policies**.
13. (JWT only) In the OAuth Policies section, select **Admin approved users are pre-authorized for Permitted Users**, and click **OK**.
14. (JWT only) Click **Save**.
15. (JWT only) Click **Manage Profiles** and then click **Manage Permission Sets**. Select the profiles and permission sets that are pre-authorized to use this connected app. Create permission sets if necessary.

## Encrypt and use the `server.key` in CI Build Environment
Encrypt the `server.key` generated above using the instructions below.

1. Generate a `key` and `initializtion vector (iv)` to encrypt your `server.key` file locally. The `key` and `iv` will be used by CI Tool to decrypt your server key in the build environment.

    ```
    openssl enc -aes-256-cbc -k <passphrase here> -P -md sha1 -nosalt
    ```

    Make note of the `key` and `iv` values output to the screen.

2. Encrypt the `server.key` using the newly generated `key` and `iv` values.

    ```
    openssl enc -nosalt -aes-256-cbc -in server.key -out server.key.enc -base64 -K <key from above> -iv <iv from above>
    ```

3. Store the `key` and `iv` contents as protected environment variables in the CI Tool. These values are considered secret so please treat them as such. For example you can store the `key` as `$DECRYPTION_KEY` and the `iv` as `$DECRYPTION_IV`.

4. Add the `server.key.enc` file into your project. Starting from now you can keep it under VCS and use it in the build environment in order to decrypt the `server.key`. Let's suppose you're adding it to `assets/server.key.enc`, to decrypt the `server.key` you can run:
    ```
    openssl enc -nosalt -aes-256-cbc -d -in assets/server.key.enc -out assets/server.key -base64 -K $DECRYPTION_KEY -iv $DECRYPTION_IV
    ```