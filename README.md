# Discord Q&A Bot

A simple discord bot which allows the management of questions and answers in discord servers akin to something like stackoverflow but while maintaing the minimalism of a normal text channel. Additionally the bot has an accompanying [_dashboard_](https://github.com/KaiErikNiermann/QandA-website) which enables people who do not use discord to also answer any questions asked via the bot.

## Current Features

- Make and modify a question
- Answer a question
- Database (mongodb) to keep track of questions and their statuses
- Accompanying dashboard to get an isolated view of just questions

## Future Features

- [] Ability to download and backup question db
- [] Markdown support for questions
- [] Improved system for incoming dashboard answers
- [] Latex support for questions

## Setup

If you want to run the bot yourself you can follow these steps.

1. Clone the repo

    ```text
    git clone https://github.com/KaiErikNiermann/QandA-discordBot.git
    ```

2. Create a `.env` file with the following contents in the bots main directory

    ```text
    DB_CONNECT=<your-mongo-db-key>
    ```

3. Run the bot

    ```text
    npm start
    ```

### prerequesites

You might need some preresequesites to get things going, so if you get any errors make sure you have nodejs and npm installed.

#### nodejs and npm

For ubuntu/debian you should to install nodejs and npm using the following commands, just replace `<version-number>` with the correct version, for example 18.

```text
curl -sL https://deb.nodesource.com/setup_<version-number>.x | sudo -E bash - && 
sudo apt-get install -y nodejs &&
npm install -g npm@latest
```
