import {Component, Inject, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {Command} from "../../models/command";
import {DialogService, DynamicDialogConfig, DynamicDialogRef} from "primeng/dynamicdialog";
import {CommandRepoService} from "../../service/command-repo.service";
import {ButtonModule} from "primeng/button";
import {InputTextModule} from "primeng/inputtext";


@Component({
    selector: 'app-send-command',
    templateUrl: './send-command.component.html',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        ButtonModule,
        InputTextModule
    ],
    styleUrls: ['./send-command.component.css']
})
export class SendCommandComponent implements OnInit {
    title: string = 'Send Command';
    commandForm!: FormGroup;
    buttonText: string = 'Send';
    command!: Command;

    constructor(public config: DynamicDialogConfig,private fb: FormBuilder,private ref:DynamicDialogRef) {
        this.command = this.config.data
    }

    ngOnInit(): void {
        this.createForm();
    }

    onSubmit(): void {
        this.ref.close(this.commandForm.value);
    }

    createForm(): void {
        this.commandForm = this.fb.group({
            DeviceId: [this.command.DeviceId],
            Command: [, Validators.required],
            Channel: [this.command.Channel]
        });
    }

}
