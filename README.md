## Note About the State of This Repo (10/14/2019):

> This project is an unstable work in progress at the moment.

***

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

# Create React App Server

Tired of trying to figure out how to implement server side rendering in your application while keeping up with major releases of React? Frustrated with the framework you chose to make this process easier?

Despite major progress of the HTTP protocol and engines serving web pages, server side rendering remains important for many reasons. Imagine a world in which one could write React code in a standardized way, utilizing the newest core methods and techniques. [Create React App](https://create-react-app.dev/) provides a simple, standardized boilerplate to get up and running with a React app. Nowadays, Create React App is used as a starting point for robust web applications, but it isn't compatible with server side rendering. So, how does Create React App Server breakthrough this compatibility issue? The answer - it doesn't! Create React App Server provides server side rendering as a standalone process.

# What is This?

Create React App Server is a Node.js [Express](https://expressjs.com/) application. It accepts Express customization options and more. It serves static files from a Create React App build. It parses client side rendered HTML, writes output to HTML files on disk, and caches the relationship in memory so proceeding requests are served a static file without heavy lifting.
