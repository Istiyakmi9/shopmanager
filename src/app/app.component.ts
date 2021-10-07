import { Component, OnInit } from "@angular/core";
import { Router, NavigationStart, NavigationEnd, Event as NavigationEvent } from '@angular/router';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements OnInit {
  title = "Business manager";
  loginPage: boolean = true;
  constructor(private router: Router) { 
    router.events.forEach((event: NavigationEvent) => {
      if (event instanceof NavigationStart) {
          switch (event.url) {
            case "":
            case "/":
              this.loginPage = true;
              break;  
            default:
              this.loginPage = false;
          }
      }
    });
  }

  ngOnInit() {}
}
