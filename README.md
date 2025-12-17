## to run the app in development server first install:
1. node.js
2. Docker

## then run the commands:
### Build:
- npm install
- npm install -g dotenv-cli
- npm run db:restart:dev

### Start:
npm run start:dev

## Notes about templating
- templates are stored in the views folder outside src
- public folder houses assets store your images/any asset in there
- always use the base njk file using {% extends "base.njk" %} to have access to tailwind and other shared structure, add your content in the content block using {% block content %} {% endblock %} example is in example.njk
- a working example is in views/example.njk
- controllers for serving general non domain specific templates is in src/core, you will find an example controller there
- to add general css add it in src/css/styles.css