
# Social Network

The purpose of this social network is to connect people and provide a platform for them to share ideas, collaborate, and build connections that extend beyond real life. The goal is to foster a digital community for people to support each other in their academic and personal lives.


## Tech Stack

**Client:** Html, CSS, JavaScript, Socket.io

**Server:** NodeJS, Express, PostgreSQL, Socket.io


## Installation

Clone the repository

```bash
  cd Desktop/
  git clone https://github.com/jrmoha/social-network
```

## Install dependencies

```bash
  cd social-network/
  npm i
```

## Getting TypeScript
Add Typescript to project `npm`.
```
npm install -D typescript
```
## Project Structure
The folder structure of this app is explained below:

| Name | Description |
| ------------------------ | --------------------------------------------------------------------------------------------- |
| **dist**                 | Contains the distributable (or output) from your TypeScript build.  |
| **node_modules**         | Contains all  npm dependencies                                                            |
| **src**                  | Contains  source code that will be compiled to the dist dir                               |
| **src/controllers**      | Controllers define functions to serve various express routes. 
| **src/middleware**      | Express & Multer & Socket middlewares which process the incoming requests before handling them down to the routes
| **src/routes**           | Contain all express routes, separated by module/area of application                       
| **src/models**           | Models define schemas that will be used in storing and retrieving data from Application database  |
| **src/utils**/config.ts       | Application configuration including environment-specific configs 
|**src/utils**/functions.ts    |Collection of functions to make things easy and organized
|**src/database**/index.ts| Database configuration
|**src/public/script**|Front-End side JavaScript
|**src/types**|Different types included in project such as user, post..etc
| **src**/app.ts         | Entry point to express app|
| package.json             | Contains npm dependencies    
| tsconfig.json            | Config settings for compiling source code only written in TypeScript    
| .eslintrc.js             | Config settings for ESLint code style checking                                                | 
| .prettierrc.json          | Config settings for prettier style|


## Building the project

### Running the build

All the different build steps are orchestrated via [npm scripts](https://docs.npmjs.com/misc/scripts).
Npm scripts basically allow us to call (and chain) terminal commands via npm.

| Npm Script | Description |
| ------------------------- | ------------------------------------------------------------------------------------------------- |
|`db:migrate`||Create All Entities and Relations|
|`db:rollback`||Drop All Entities and Relations|
| `build`                   | Converts TypeScript based file out to dist directory                  |
| `lint:fix`                   |automatically fixes any errors or warnings that the linter can fix.     |
| `format`                   |format code for better visualization      |
| `test`                   | Runs unit testing        |
| `startDev`                   |watches for changes to TypeScript files in the src directory and automatically restarts the application using ts-node when changes are detected. This makes it easy to test and iterate on the application during development, without the need to manually stop and start the application.                                         |

### Example .env 
# replace every sentence in double quote with yours
```
NODE_ENV="your current environment development or testing"
PORT=3000
DATABASE_HOST="Database host"
DATABASE="Development database name"
DATABASE_TEST="Testing database name"
DATABASE_USERNAME=postgres
DATABASE_PASSWORD="your postgresql database password"
DATABASE_PORT=5432
GOOGLE_CLIENT_ID="google client id"
GOOGLE_CLIENT_SECRET="google client secret"
GOOGLE_CALLBACK_URL="google callback url"
GITHUB_CLIENT_ID="github client id"
GITHUB_CLIENT_SECRET="github client secret"
GITHUB_CALLBACK_URL="github callback url"
JWT_SECRET="jwt secret"
MESSAGE_SECRET="messages encryption secret"
```

## Usage/Examples

```
The Front-End Ain't Uploaded 
If you want to use the project 
just adjust end-points in the src/controllers directory 
```


## Documentation

[Documentation](https://github.com/jrmoha/social-network/blob/master/documentation.pdf)


## Authors

- [Mostafa Mohammed](https://www.github.com/jrmoha)
- [Ziad Kamel](https://github.com/zika184)
