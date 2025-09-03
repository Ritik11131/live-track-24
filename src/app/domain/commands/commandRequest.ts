export interface CommandRequest{
    deviceId: number | undefined,
    commandType:string,
    command:string | undefined
}