<div  align="center">
<img src="public/logo.svg" width="100" height="100" alt="logo" title="logo" /></div>
<h1 align="center" >Facebook - SSR Web Application with Next.js and Firebase</h1>
<br />

Project is created with:

* Next.js v13.0.6 , Typescript and SASS
* Firebase , [Cloud Storage](https://firebase.google.com/docs/storage/web/start) and [Cloud Firestore](https://firebase.google.com/docs/firestore)
* [Firebase-Admin-SDK](https://www.npmjs.com/package/firebase-admin) and [Nookies](https://www.npmjs.com/package/nookies)
* [use-gesture](https://www.npmjs.com/package/@use-gesture/react) and [react-spring](https://www.npmjs.com/package/react-spring)
* [Font-Awesome](https://fontawesome.com) and [nprogress](https://www.npmjs.com/package/nprogress)

## Features

:ballot_box_with_check: Easily navigate between tabs by dragging \
:ballot_box_with_check: Sign up with Email & Password \
:ballot_box_with_check: Sort the posts by their creation time (createdAt)\
:ballot_box_with_check: Dyanmic Routes for Author Profile and Post \
:ballot_box_with_check: Fetch All posts using server-side rendering (SSR), excluding posts that are marked as "Only Me" \
:ballot_box_with_check: Get more (posts , comments and liked users) with Infinite scrolling \
:ballot_box_with_check: Fetch Posts with author details , like count , comments and shared post \
:ballot_box_with_check: Allow users to view comments and liked users \
:ballot_box_with_check: Allow users to update their profile by modifying their userName, bio, and profile pictures\
:ballot_box_with_check: Creating new posts and Updating with customizable privacy \
:ballot_box_with_check: Liking/commenting on existing posts, and sharing posts with others \
:ballot_box_with_check: Select and Delete Multiple Posts \
:ballot_box_with_check: Users have the ability to save their favorite posts \
:ballot_box_with_check: Implement media (photos and videos) upload functionality by leveraging the power of Firebase Cloud Storage \
:ballot_box_with_check: Enable image preview layout and zoom capability for a better user experience \
:ballot_box_with_check: Store the id_token in cookies with [nookies](https://www.npmjs.com/package/nookies) to fetch SSR data with the stored uid \
:ballot_box_with_check: Friends Request , acceptable and blockable \
:ballot_box_with_check: Friends Request Sound Play in App Mode (Add to HomeScreen due to Browser Autoplay ploicy) \
:ballot_box_with_check: Users will receive notifications when their posts are liked,commented and shared by other users

## User-Interface

![facebook-ui](https://github.com/thanhtutzaw/facebook-ui/assets/71011043/22e082c7-81d0-47ff-a7b1-a1067167d6f5)

## Demo

<img src="public/logo.svg" width="18" height="18" alt="logo" title="logo" />  [Facebook-ui-zee](https://facebook-ui-zee.vercel.app/)

## Setup

To run this project, install it locally using npm:

```bash
git clone https://github.com/thanhtutzaw/facebook-ui.git
cd facebook-ui
cp .env.local.example .env.local
npm install
npm run dev
```
