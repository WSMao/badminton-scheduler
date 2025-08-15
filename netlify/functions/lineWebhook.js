import { Client, middleware } from "@line/bot-sdk";

import 'dotenv/config';

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const client = new Client(config);

export async function handler(event) {
  // only take POST request
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }
  
  // parse JSON from LINE
  const body = JSON.parse(event.body);
  const events = body.events || [];

  let replyText = "";

  // process all events
  const results = await Promise.all(
    events.map(async (e) => {
      if (e.type === "message" && e.message.type === "text") {
        const receivedText = e.message.text;
        replyText = `Msg received: ${receivedText}`;

        if (process.env.TESTING === "true") {
          console.log("[LOCAL TEST]: ", replyText);
        } else {
          // reply by using LINE API only in production environment
          await client.replyMessage(e.replyToken, {
            type: "text",
            text: replyText,
          });
        }

        return { ok: true, reply: replyText };
        
      } else {
        return { ok: false, reason: "Not a text message" };
      }
    })
  );

  return {
    statusCode: 200,
    body: "OK\n",
  };
}