package chutebot

type Chutebot struct {
	discord *ChutebotDiscord
	twitter *ChutebotTwitter
}

func Start() *Chutebot {
	env := BuildEnv()

	discord := CreateDiscordSession(env.discordBotToken, env.discordGuildId)
	twitter := CreateTwitterClient(env.twitterToken)

	return &Chutebot{
		discord: discord,
		twitter: twitter,
	}
}
