/* 
client.on('messageCreate', async (message) => {
    if (ifActive) {
        if (message.author.bot) return;
        try {
            message.channel.sendTyping();
            const completion = await openai.createChatCompletion({
                model: 'gpt-3.5-turbo',
                messages: [{ role: 'user', content: message.content }],
            });
            if (completion.data.choices[0].message.content === undefined) {
                throw new Error('No response from AI.');
            }
            await message.channel.send({
                content: completion.data.choices[0].message.content,
                reply: { messageReference: message.id },
                allowedMentions: { repliedUser: false },
            });
        } catch (err) {
            console.error(err);
        }
    }
});
*/