"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cache_1 = require("../libs/cache");
const socket_1 = require("../libs/socket");
const Message_1 = __importDefault(require("../models/Message"));
const logger_1 = require("../utils/logger");
const GetTicketWbot_1 = __importDefault(require("./GetTicketWbot"));
const SetTicketMessagesAsRead = async (ticket) => {
    await ticket.update({ unreadMessages: 0 });
    await cache_1.cacheLayer.set(`contacts:${ticket.contactId}:unreads`, "0");
    let companyid;
    try {
        const wbot = await (0, GetTicketWbot_1.default)(ticket);
        const getJsonMessage = await Message_1.default.findAll({
            where: {
                ticketId: ticket.id,
                fromMe: false,
                read: false
            },
            order: [["createdAt", "DESC"]]
        });
        companyid = getJsonMessage[0]?.companyId;
        if (getJsonMessage.length > 0) {
            const lastMessages = JSON.parse(JSON.stringify(getJsonMessage[0].dataJson));
            const number = ticket.isGroup ? `${ticket.contact.number.substring(12, 0)}-${ticket.contact.number.substring(12)}@g.us` : `${ticket.contact.number}@s.whatsapp.net`;
            if (lastMessages.key && lastMessages.key.fromMe === false) {
                await wbot.chatModify({ markRead: true, lastMessages: [lastMessages] }, number
                // `${ticket.contact.number}@${
                //   ticket.isGroup ? "g.us" : "s.whatsapp.net"
                // }`
                );
            }
        }
        await Message_1.default.update({ read: true }, {
            where: {
                ticketId: ticket.id,
                read: false
            }
        });
    }
    catch (err) {
        console.log(err);
        logger_1.logger.warn(`Could not mark messages as read. Maybe whatsapp session disconnected? Err: ${err}`);
    }
    const io = (0, socket_1.getIO)();
    if (companyid) {
        io.emit(`company-${companyid}-ticket`, {
            action: "updateUnread",
            ticketId: ticket?.id
        });
    }
    io.to(ticket.status).to("notification").emit("ticket", {
        action: "updateUnread",
        ticketId: ticket.id
    });
};
exports.default = SetTicketMessagesAsRead;
