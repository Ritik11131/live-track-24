import {Injectable} from '@angular/core';
import {AngularFirestore} from "@angular/fire/compat/firestore";
import {Observable} from "rxjs";
import {map} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class FirebaseService {

    constructor(private firestore: AngularFirestore) {
    }

    saveDeviceData(deviceId: string, data: any): Promise<void> {
        return this.firestore.collection('config_device').doc(deviceId).set(data);
    }

    getDeviceData(deviceId: string): Observable<any> {
        return this.firestore.collection('config_device').doc(deviceId).valueChanges();
    }
    saveUserConfig(id: number, configData: any): Promise<void> {
        console.log(configData)
        return this.firestore.collection('users').doc(id.toString()).set({
            webConfig: {
                reports: configData.webConfig.reports,
                actions: configData.webConfig.actions,
                options: configData.webConfig.options,
                permissions: configData.webConfig.permissions,

            },
            androidConfig: {
                reports: configData.androidConfig.reports,
                actions: configData.androidConfig.actions,
                options: configData.androidConfig.options,
                permissions: configData.androidConfig.permissions,

            }
        });
    }


    getUserConfig(id: number): Observable<any> {
        return this.firestore.collection('users').doc(id.toString()).valueChanges().pipe(
            map((data: any) => {
                // Ensuring the structure
                return {
                    webConfig: {
                        reports: data.webConfig.reports || {},
                        actions: data.webConfig.actions || {},
                        options: data.webConfig.options || {},
                        permissions: data.webConfig.permissions || {},

                    },
                    androidConfig: {
                        reports: data.androidConfig.reports || {},
                        actions: data.androidConfig.actions || {},
                        options: data.androidConfig.options || {},
                        permissions: data.androidConfig.permissions || {},

                    }
                };
            })
        );
    }


    getAllDeviceConfigs(): Observable<any[]> {
        return this.firestore.collection('config_device').snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data() as any;
                const id = a.payload.doc.id;
                return { id, ...data };
            }))
        );
    }
    getAllUserConfigs(): Observable<any[]> {
        return this.firestore.collection('users').snapshotChanges().pipe(
            map(actions => actions.map(a => {
                const data = a.payload.doc.data() as any;
                const id = a.payload.doc.id;
                return { id, ...data };
            }))
        );
    }
}
