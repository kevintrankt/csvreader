import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { InputsComponent } from './inputs/inputs.component';
import { LinechartComponent } from './linechart/linechart.component';

@NgModule({
  declarations: [
    AppComponent,
    InputsComponent,
    LinechartComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
