
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
:ballot_box_with_check:	Easily navigate between tabs by dragging \
:ballot_box_with_check:	Sign up with Email & Password \
:ballot_box_with_check:	Sort the posts by their creation time (createdAt)\
:ballot_box_with_check:	Dyanmic Routes for Author Profile and Post \
:ballot_box_with_check:	Fetch All posts using server-side rendering (SSR), excluding posts that are marked as "Onlyme" and Get more posts with Infinite scrolling \
:ballot_box_with_check:	Fetch Posts with author details , post like count , shared post and more \
:ballot_box_with_check:	Allow users to update their profile by modifying their userName, bio, and Account displayName \
:ballot_box_with_check: Creating new posts and Updating with customizable privacy \
:ballot_box_with_check: Liking/commenting on existing posts, and sharing posts with others \
:ballot_box_with_check:	Select and Delete Multiple Posts\
:ballot_box_with_check:	Users have the ability to save their favorite posts and copy post URLs \
:ballot_box_with_check:	Implement media (photos and videos) upload functionality by leveraging the power of Firebase Cloud Storage \
:ballot_box_with_check: Enable image preview layout and zoom capability for a better user experience \
:ballot_box_with_check:	Store the id_token in cookies using [nookies](https://www.npmjs.com/package/nookies) to fetch SSR data with the stored userId

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
