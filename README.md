# test API 

Snel wat in elkaar gezet en iets met monorepo's vooral het beheren van de grotere projecten is dat wel handig voor beheer. en dit maakt het ook mogelijk om met microservices te werken.
Gekozen voor simpel npm, omdat niet te complex wil gaan in deze demo :D 

Flow die het test-api gebruikt qua infrastructure

```shell

[ gebruiker ] ->  [ Cloudfront CND ] ->  [ Api gateway ] ->  [ Lambda ] ->  [ Dynamodb ] 

```
Heb geen rekening gehouden met architecture patronen, CICD, Linting, Testing of andere ongein.

## How NX Monorepo works

Nx werkt door één package.json te hebben op root niveau.
Alle dependencies (YARN/NPM externe libraries) worden daar toegevoegd.
Let op: het upgraden van een dependency kan invloed hebben op andere projecten!
Vanaf dit niveau zorgt het ervoor dat alle projecten worden gedeployed en getest.
De meeste projecten moeten in de apps folder staan.
De libs folder moet gedeelde libraries bevatten, zoals een components library.
Elk project bevat een project.json bestand, waarin de commands staan die Nx kan gebruiken. Nx gebruikt de package.json scripts als tweede reeks commands die het kan uitvoeren.

## File layout


```shell
.
├── apps/    # apps
  ├── test-api/    # Example nx app
    ├── infra/ # infrastructure code for the app
      ├── Pulumi.yaml # config for deployment to aws
      ├── index.ts # infra code 
    ├── src/ # functional code
      ├── functions/ # aws functions
    ├── project.json # used by nx to indentify the monorepo app/service
    ├── tsconfig.json # typescript config
├── libs/      # libaries, these can be shared over multiple apps & generators for nx // not for this test
├── ci/ # cicd pipeline, not made yet. this just a test ;) 
├── scripts/build # eigenlijk zou dat bij libs moeten maar nu even snel in elkaar het gooien. 
├── README.md   # this amazing file :D  
├── package.json # package management
├── nx.json # NX config
├── .editorconfig # configurations for all editors
├── .gitignore 
├── tsconfig.base.json # typescript config for all apps
```

## Installatie

- [Node.js](https://nodejs.org/) v.22.9.0 is required. It is recommended to use [nvm MAC/Linux](https://github.com/nvm-sh/nvm) or [nvm Windows](https://github.com/coreybutler/nvm-windows), and to run `nvm use` in the terminal for this project.

- :package: Package Manager

  - [NPM](https://npmjs.com)

- Install these plugins in your code editor.

  - [EditorConfig](https://editorconfig.org/)

- [Pulumi CLI](https://www.pulumi.com/docs/install/)
- [AWS CLI](https://aws.amazon.com/cli/)


## Usage


### POST /register
Nieuwe gebruiker registreren
```json
{
  "email": "user@example.com",
  "password": "securepass",
  "firstName": "John",
  "lastName": "Doe"
}
```

### POST /login
Inloggen met credentials
```json
{
  "email": "user@example.com",
  "password": "securepass"
}
```

### GET /me
Ophalen gebruikersprofiel (vereist Authorization header met Bearer token)

### GET /stats
Ophalen totaal aantal geregistreerde gebruikers

## Development Commands

## NX for just test-api

- **Build de API**
  ```shell
  npx nx build test-api
  ```

- **Deploy de API**
  ```shell
  npx nx deploy test-api --stack dev
  ```

- **Preview deployment**
  ```shell
  npx nx preview test-api --stack dev
  ```

- **Verwijder deployment**
  ```shell
  npx nx destroy test-api --stack dev
  ```

- **Refresh deployment** (voor als iemand direct in AWS heeft aangepast)
  ```shell
  npx nx refresh test-api --stack dev
  ```


## NX for all projects that you could have touched
**Local development**

Nog niet mogelijk in deze test maar zou dan worden gemaakt met localstack of andere emulators.

- **Build a service dev**

  ```shell
  npx nx affected -t build
  ```
- **Deploy a service dev**

  ```shell
  npx nx affected -t deploy --stack dev
  ```
- **preview a deployment service dev**
  ```shell
  npx nx affected -t preview --stack dev
  ```

- **destroy a deployment service dev**
  ```shell
  npx nx affected -t destroy --stack dev
  ```
- **refresh a deployment service dev** (for if a developer f*ed up and coded directly in aws)
  ```shell
  npx nx affected -t destroy --stack dev
  ```
