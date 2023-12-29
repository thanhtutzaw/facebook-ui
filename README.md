<div  align="center">
<img src="public/logo.svg" width="100" height="100" alt="logo" title="logo" /></div>
<h1 align="center" >Facebook - SSR Web Application with Next.js and Firebase</h1>

<p align="center">
<a href="https://facebook-ui-zee.vercel.app">Demo</a>
.
<a href="[/](https://www.youtube.com/playlist?list=PL7OpFd3agQxb3jOqAVm4msHNlH34uai3i)">Youtube Playlist</a>
</p>
<br />

Project is created with:

* Next.js v13.0.6 , Typescript , Tailwind CSS and SASS
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
:ballot_box_with_check: Liking/commenting on existing posts,comments and sharing posts with others \
:ballot_box_with_check: Select and Delete Multiple Posts \
:ballot_box_with_check: Users have the ability to save their favorite posts \
:ballot_box_with_check: Implement media (photos and videos) upload functionality by leveraging the power of Firebase Cloud Storage \
:ballot_box_with_check: Enable image preview layout and zoom capability for a better user experience \
:ballot_box_with_check: Store the id_token in cookies with [nookies](https://www.npmjs.com/package/nookies) to fetch SSR data with the stored uid \
:ballot_box_with_check: Friends Request , acceptable and blockable \
:ballot_box_with_check: Friends Request Sound play in App Mode (Add to HomeScreen due to Browser Autoplay ploicy) \
:ballot_box_with_check: Users will receive Inbox notifications when their posts and comments are liked,commented and shared by other users \
:ballot_box_with_check: Crop the profile picture to 256x256 pixels to ensure it displays with the correct aspect ratio in the notification icon \
:ballot_box_with_check: Notification actions are also enabled to enhance the user experience without the need to open a web page. \
   Available actions are "accept-FriendRequest" , "like-comment" , "reply-comment" \
:ballot_box_with_check: Push notificatons to multiple devices with Firebase Cloud messaging for foreground and background notificatons.

## User-Interface

<table>
  <tr>
    <td width="35%">

  [<img src="https://i.ytimg.com/vi/CRV3aZOFefQ/hqdefault.jpg?sqp=-oaymwEXCNACELwBSFryq4qpAwkIARUAAIhCGAE=&rs=AOn4CLBqtT-uhS2uJy8JiALvbaBPFnL7hg" alt="Demo Video" width="100%">](https://www.youtube.com/watch?v=CRV3aZOFefQ&list=PL7OpFd3agQxb3jOqAVm4msHNlH34uai3i&index=1 "Demo Video")



#### Demo Facebook Clone



[PlayList on Youtube](https://www.youtube.com/watch?v=CRV3aZOFefQ&list=PL7OpFd3agQxb3jOqAVm4msHNlH34uai3i&index=1)

</td>
<td width="45%">

[<img src="https://i9.ytimg.com/vi/qHDI74wPjZc/mqdefault.jpg?v=657818a9&sqp=CKDQuKwG&rs=AOn4CLAIZYDUt7UXM1dopJRThxlKedJ9Cg" alt="Comment Reaction" width="100%">](https://www.youtube.com/watch?v=qHDI74wPjZc&list=PL7OpFd3agQxb3jOqAVm4msHNlH34uai3i&index=2 "Comment Reaction")



#### Comment Reaction



[PlayList on Youtube](https://www.youtube.com/playlist?list=PL7OpFd3agQxb3jOqAVm4msHNlH34uai3i)

</td>
<td width="50%">

  [<img src="https://i9.ytimg.com/vi/9THDU0eoA48/mqdefault.jpg?v=657d2945&sqp=CPTNuKwG&rs=AOn4CLCOjhFm-ULoGJ7kcgAq0zXDpuCjNA" alt="Comment Reaction" width="100%">](https://www.youtube.com/watch?v=9THDU0eoA48&list=PL7OpFd3agQxb3jOqAVm4msHNlH34uai3i&index=4 "Comment Reply")



#### Comment Reply



[PlayList on Youtube](https://www.youtube.com/playlist?list=PL7OpFd3agQxb3jOqAVm4msHNlH34uai3i)

</td>
  </tr>




</table>


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
