
<div align="center">
<img src="public/logo.svg" width="100" height="100" alt="logo" title="logo" /></div>
<h1 align="center" >Facebook - SSR Web Application with Nextjs and Firebase</h1>
<br />

Project is created with:
* Next.js v13.0.6 , Typescript and SASS
* Firebase , [Cloud Storage](https://firebase.google.com/docs/storage/web/start) and [Cloud Firestore](https://firebase.google.com/docs/firestore)
* [Firebase-Admin-SDK](https://www.npmjs.com/package/firebase-admin) and [Nookies](https://www.npmjs.com/package/nookies)
* [use-gesture](https://www.npmjs.com/package/@use-gesture/react) and [react-spring](https://www.npmjs.com/package/react-spring)
* [Font-Awesome](https://fontawesome.com) and [nprogress](https://www.npmjs.com/package/nprogress)

## Features
:ballot_box_with_check:	Navigate Tabs by Dragging\
:ballot_box_with_check:	Sign up with Email Password \
:ballot_box_with_check:	Sort Posts by createdAt\
:ballot_box_with_check:	Dyanmic Routes ( user/post )\
:ballot_box_with_check:	Fetch All Users Posts - SSR\
:ballot_box_with_check:	Fetch User Record by AuthorId - SSR\
:ballot_box_with_check:	Update User Profile (userName,bio) and Account displayName\
:ballot_box_with_check:	Select and Delete Multiple Posts\
:ballot_box_with_check:	User can save Favourite Post and Copy Post Url \
:ballot_box_with_check:	Upload Media (Store in Firebase Cloud Storage) \
:ballot_box_with_check: Image Preview Layout and Zoom image
:ballot_box_with_check:	Store id_token in cookies with [nookies](https://www.npmjs.com/package/nookies) for SSR userId

## User-Interface
![facebook-ui](https://github.com/thanhtutzaw/facebook-ui/assets/71011043/aebfa8bd-d6d4-4879-8074-023d83647ab4)

## Demo
<img src="public/logo.svg" width="18" height="18" alt="logo" title="logo" />  [Facebook-ui-zee](https://facebook-ui-zee.vercel.app/)

## Setup
To run this project, install it locally using npm:

```
$ git clone https://github.com/thanhtutzaw/facebook-ui.git
$ cd facebook-ui
$ cp .env.local.example .env.local
$ npm install
$ npm run dev
```
