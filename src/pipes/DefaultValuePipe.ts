import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'default' })
export class DefaultValuePipe implements PipeTransform {
  transform(value: string, defaultValue: string) {
    if(value == null || value == "")
        return defaultValue;
    return value;
  }
}