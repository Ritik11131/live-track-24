import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MessageService } from "primeng/api";
import { CommonUtils } from "src/app/utils/commonUtils";
import { UserService } from "../../services/user.service";
import { Observable } from "rxjs";
import { User } from "../../models/user.model";
@Injectable()
export class userPasswordRepository {

    constructor(
        public userService: UserService,

        private messageService: MessageService,
        private httpClient: HttpClient,
      
    
      ) {
        CommonUtils.init(httpClient, messageService);
      }
    


     updateUserData(id: number, user: User): Observable<User> {
        return new Observable<User>((observer) => {
          this.userService.updateUser(id,user).subscribe(
            (data) => {
              observer.next(); // Emit the notifications
              observer.complete(); // Complete the observable
            },
            (error) => {
              observer.error(error); // Emit an error if there's any
            }
          );
        });
      }
}

