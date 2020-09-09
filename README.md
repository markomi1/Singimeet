# Singimeet

Angular project i created in a span of about 2 weeks, started with 0 Angular knowledge, ended with something i think is somewhat decent.
One of the project requirements was that everything should be done on the client side, aka, no backend, and that is why this project is using IndexedDB.
When running this project for the first time, go to `http://localhost:4200/debug` and click on the buttons in any order to add data to IndexedDB.

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.1.

## Docker image

I created a Docker image of this project, to pull and run the image use: 

`docker run --name <name-of-the-container> -d -p 8080:80 markomi1/singimeet:nginx-alpine`

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
