import { Component, OnInit } from "@angular/core";
import * as $ from "jquery";

@Component({
  selector: "app-chattingbox",
  templateUrl: "./chattingbox.component.html",
  styleUrls: ["./chattingbox.component.scss"]
})
export class ChattingboxComponent implements OnInit {
  SenderTag: string;
  ReceiverTag: string;
  constructor() {
    this.SenderTag = `<div class="float-left w-100 mt-2">
                        <div class="circle-user-snd float-left">U</div>
                        <div class="msg float-right sender arrow_box-before">
                          <div class="d-block">{{SND-MSG}}</div>
                          <small class="small small-font">{{SND-TIME}}</small>
                        </div>
                      </div>`;
    this.ReceiverTag = `<div class="float-left w-100 mt-2">
                          <div class="msg float-left receiver arrow_box-after">
                            <div class="d-block">{{RCV-MSG}}</div>
                            <small class="small small-font">{{RCV-TIME}}</small>
                          </div>
                          <div class="circle-user-rcv float-right">U</div>
                        </div>`;
  }

  ngOnInit() {}

  GetCurrentTime() {
    let CurrentTime =
      new Date().getHours() +
      ":" +
      new Date().getMinutes() +
      ":" +
      new Date().getSeconds();
    return CurrentTime;
  }

  ReceiveMessage(Message: string) {
    let SendMessage = this.ReceiverTag;
    SendMessage = SendMessage.replace("{{RCV-MSG}}", Message).replace(
      "{{RCV-TIME}}",
      this.GetCurrentTime()
    );
    $("#chat-room").append(SendMessage);
  }

  SendMessage() {
    let SendMessage = this.SenderTag;
    SendMessage = SendMessage.replace("{{SND-MSG}}", $("#msg").val()).replace(
      "{{SND-TIME}}",
      this.GetCurrentTime()
    );
    $("#chat-room").append(SendMessage);
    this.AskBots($("#msg").val());
    $("#msg").val("");
  }

  AskBots(UserMsg: string) {
    let Message = "";
    let _userMsg = UserMsg.toLowerCase();
    if (_userMsg.indexOf("hi") === 0) {
      Message = "Hi how are you ?";
    } else if (_userMsg.indexOf("hello") === 0) {
      Message = "Hello what can i do for you !!!";
    } else if (_userMsg.indexOf("version") !== -1) {
      Message = "I am recently developed and my version is 1.0";
    } else if (_userMsg.indexOf("your owner") !== -1) {
      Message = "I am a bot and developed my Misba-ur-Rehman";
    } else if (_userMsg.indexOf("yourself") !== -1) {
      Message =
        "This bots is developed to just refill a minimal gap of AI. Soon new and updated version will launch.";
    } else {
      Message = "This is beyond my ability";
    }
    setTimeout(() => {
      this.ReceiveMessage(Message);
      $("#chat-room").animate({ scrollTop: $("#chat-room").height() }, 1000);
    }, 1000);
  }
}
