# TUTU
An Interactive Map of Credible News Outlets in the Philippines

## Requirements
* [Python v3.6+](https://www.python.org/downloads/)
* [Node.js v9.2+](https://nodejs.org/en/download/current/)

  ### NPM Global Packages
  * [yarn](https://www.npmjs.com/package/yarn)
  * [create-react-app](https://www.npmjs.com/package/create-react-app)



## User Client Installation

```sh
cd app/client/

yarn install
yarn start
```
The default port is 3000

## Admin Client Installation

```sh
cd app/admin/

yarn install
yarn start
```
The default port is 3001

## Server Installation

```sh
cd server/

yarn install
yarn start
```
The default port is 5000

## Spider Installation

```sh
cd spider/

pip install pipenv
pipenv install

pipenv run python spider.py
```
It will scrape the sources after running



# Project Structure
```
tutu
├── README.md
├── .eslintrc
├── .gitignore
├── app
│   ├── admin
│   │   └── package.json
│   └── client
│       └── package.json
├── server
│   └── package.json
└── spider
    └── spider.py
    └── Pipfile.lock
    └── Pipfile
```
can someone update this pls
