const axios = require('axios').default
const { resolveColor } = require('discord.js')
const {
  customization: { accent }
} = require('../config.json')

module.exports = {
  id: 'addmessage',
  async execute(interaction) {
    if (!checkUserPerms(interaction))
      return interaction.reply({
        content: 'You do not have permission to do that!',
        ephemeral: true
      })
    const messageId = interaction.fields.fields.find(f => f.customId === 'messageId').value
    const issueMessage = await interaction.channel.messages.fetch(messageId).catch(() => null)
    if (!issueMessage)
      return interaction.reply({
        content: 'I could not find that message!',
        ephemeral: true
      })

    const id = interaction.fields.fields.find(f => f.customId === 'id').value
    const extraInfo = interaction.fields.fields.find(f => f.customId === 'extrainfo').value
    const attachments = issueMessage.attachments.map(a => `[${a.name}](${a.url})`)
    const imageTypes = ['png', 'jpg', 'jpeg', 'webp', 'gif']
    const thumbnail = issueMessage.attachments.filter(f => imageTypes.includes(f.name.split('.')[0]))[0]
    const res = await axios(`https://api.github.com/repos/UTMDiscordBot/testing/issues/${id}/comments`, {
      method: 'POST',
      headers: {
        Accept: 'application/vnd.github+json',
        // this token got reset so don't waste your time ;)
        Authorization: 'token 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'
      },
      data: {
        body: `${issueMessage.content}${attachments.length !== 0 ? `<br><h2>Attachments:</h2>${attachments.join('<br>')}` : ''}${
          extraInfo.length !== 0 ? `<br><h2>Extra Information:</h2>${extraInfo}` : ''
        }<br><details><summary><h2>Issuer and moderator</h2></summary>Issuer: ${issueMessage.author.tag}<br>Moderator: ${interaction.user.tag}</details>`
      }
    }).catch(() => null)
    if (!res || !res.data)
      return interaction.reply({
        content: 'I could not access the GitHub API!',
        ephemeral: true
      })
    const embed = {
      color: resolveColor(accent),
      title: 'Added this message as a comment!',
      thumbnail: {
        url: thumbnail
      },
      fields: [
        {
          name: 'Body',
          value: `${issueMessage.content}${extraInfo.length !== 0 ? `\n\n**Extra Information:**\n${extraInfo}` : ''}`
        },
        {
          name: 'Attachments',
          value: attachments.length !== 0 ? attachments.join('\n') : 'None'
        },
        {
          name: 'Link',
          value: res.data.html_url || 'Unknown'
        }
      ],
      footer: {
        text: 'Report any bugs or issues to BluDood#0001'
      }
    }
    await interaction.reply({
      embeds: [embed]
    })
  }
}
