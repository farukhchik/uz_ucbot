const TelegramApi = require('node-telegram-bot-api')
require('dotenv').config();
// const Promise = require('bluebird');
// Promise.config({
//     cancellation: true
// });
const {gameOptions, againOptions} = require('./options')
const sequelize = require('./db')
const UserModel = require('./models')
const token = process.env.TG_API

const bot = new TelegramApi(token, {polling: true})

const chats = {}



const startGame = async (chatId) => {
    await bot.sendMessage(chatId, '0-9 find')
    chats[chatId] = Math.floor(Math.random() * 10);
    await bot.sendMessage(chatId, 'find', gameOptions)
}

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
    } catch (e) {
        console.log('Error', e)
    }
    
    
    bot.setMyCommands([
        {command: '/start', description: 'Start bot'},
        {command: '/info', description: 'My info'},
        {command: '/game', description: 'Game'},
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const chatId = msg.chat.id;
        try {
            if (text === '/start') {
                await UserModel.create({chatId})
                await bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/282/4cd/2824cd3f-7fe3-3b32-9dc7-c9c547e7c041/2.webp')
                return  bot.sendMessage(chatId, `Hello ${msg.from.first_name}! Welcome to UC-bot`)
            }
            if (text === '/info') {
                return  bot.sendMessage(chatId, `Your name is ${msg.from.first_name}`)
            }
            if (text === '/game') {
                return startGame(chatId)
            }

            return bot.sendSticker(chatId, 'https://tlgrm.ru/_/stickers/282/4cd/2824cd3f-7fe3-3b32-9dc7-c9c547e7c041/10.webp')
        } catch (e) {
            return bot.sendMessage(chatId, 'error', e)
        }




        // bot.sendMessage(chatId, `Your wrote me ${text}`)
    })

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;
        if (data === '/again') {
           return startGame(chatId)
        }

        if (data === chats[chatId]) {
            return bot.sendMessage(chatId, `Congrats you find it ${chats[chatId]}`, againOptions)
        } else {
            return bot.sendMessage(chatId, `You can't find it - ${chats[chatId]}`, againOptions)
        }
    })
}

start()