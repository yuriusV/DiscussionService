const { events, Job } = require("brigadier")

events.on("push", (brigadeEvent, project) => {
  console.log("==> handling a 'push' event from github. Reaching out to slack to notify the proper authorities.")

  // setup variables
  var gitPayload = JSON.parse(brigadeEvent.payload)
  var brigConfig = new Map()
  
  brigConfig.set("gitSHA", brigadeEvent.commit.substr(0,7))
  brigConfig.set("eventType", brigadeEvent.type)
  brigConfig.set("branch", getBranch(gitPayload))
  brigConfig.set("imageTag", `${brigConfig.get("branch")}-${brigConfig.get("gitSHA")}`)
  
  //brigConfig.set("apiACRImage", `${brigConfig.get("acrServer")}/${brigConfig.get("apiImage")}`)

  var m = `Github ${brigadeEvent.type} event on the \"${brigConfig.get("branch")}\" branch.\nCommit link: ${gitPayload.head_commit.url}.\nCommitted by ${gitPayload.head_commit.author.username} (${gitPayload.head_commit.author.email}).`
  console.log(m)
  if (project.secrets.SLACK_WEBHOOK) {
    var container = new Job("slack-notify")

    container.image = "technosophos/slack-notify:latest"
    container.env = {
      SLACK_WEBHOOK: project.secrets.SLACK_WEBHOOK,
      SLACK_USERNAME: "BrigadeBot",
      SLACK_TITLE: `Build ${brigadeEvent.type}`,
      SLACK_MESSAGE: `${m}`,
      SLACK_COLOR: "#00ff00"
    }

    container.tasks = ["/slack-notify"]

    container.run()
  } else {
    console.log(m)
  }

})

events.on("after", (event, proj) => {
  console.log("Brigade pipeline finished successfully")

  var slack = new Job("slack-notify", "technosophos/slack-notify:latest", ["/slack-notify"])
  slack.storage.enabled = false
  slack.env = {
    SLACK_WEBHOOK: proj.secrets.SLACK_WEBHOOK,
    SLACK_USERNAME: "BrigadeBot",
    SLACK_MESSAGE: "brigade pipeline finished successfully",
    SLACK_COLOR: "#00ff00"
  }
slack.run()
  
})

function getBranch (p) {
  if (p.ref) {
      return p.ref.substring(11)
  } else {
      return "PR"
  }
}