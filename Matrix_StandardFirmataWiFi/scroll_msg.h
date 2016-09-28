/*
 LED Matrix message scroll control program  for ESP-8266 & Adafruit HT16K33 LED Driver
 by Kimio Kosaka
*/

#include "Adafruit_LEDBackpack.h"
#include "Adafruit_GFX.h"

Adafruit_8x16matrix matrix = Adafruit_8x16matrix();
#define SPEED 50                                  //scrpll speed 50mS
static char msg[1024] = {"Message in a Bottle"};  // initial message 
int16_t cursor_x;
int16_t string_dots ;
unsigned char scroll_delay;
char *buff;
char rcvbuffer[1024];

void stringCallback(char *CmdString)  // STRING_DATA handler is here
{
    //Serial.println("stringCallback");
    //Serial.println(CmdString);
    //strcpy(rcvbuffer,CmdString);

// /*  
  unsigned char cmd ;   // control command value
  unsigned int r ;    // command parameterr value 

  //parse command string
  cmd = atoi(strtok(CmdString, ",")); //command code 0x10,0x11,0x12,0x13
  if ( cmd < 0x28 ) {
    r = atoi(strtok(NULL, ","));      // r 0-255
  }else if( cmd  == 0x28 || cmd == 0x29 ){
    buff = strtok(NULL,"");  
  }
  //branch command
  switch (cmd) {
    case 0x20 : strcpy(msg,"");break; //clear massage
    case 0x21 : ; break;             //resarve for future
    case 0x22 : ; break;             //resarve for future
    case 0x23 : ; break;             //resarve for future
    case 0x24 : matrix.setBrightness(r); break;  // brightness
    case 0x25 : matrix.setRotation(r); break;   // scroll direection
    case 0x26 : scroll_delay = r; break;        // scroll speed
    case 0x27 : ; break;             //resarve for future   
    case 0x28 : strcpy(rcvbuffer,buff); break; // message recieve 1st packet
    case 0x29 : strcat(rcvbuffer,buff);        // message recieve next packet
    default:;
  }
 // */
}

/*
//message 1char to frame buffer
void msg2fbuff(unsigned char x,uint16_t *buff) {

}

//display frame buffer data to panel
void disp(char vect,uint16_t *buff) {

}
*/

// initialize LED display panel
void init_panel() {
  //Serial.begin(115200);
  delay(10);                  // wait 10mS
  matrix.begin(0x70);         // I2C address
  Wire.setClock(400000L);     // I2C clock 4MHz
  matrix.clear(); 
  matrix.setRotation(1);
  matrix.setTextSize(1); 
  //matrix.setBrightness(6);
  matrix.setTextWrap(false);  // we dont want text to wrap so it scrolls nicely
  cursor_x=15;                // start cursor point
  string_dots = 6*(strlen(msg)+1);
  if (string_dots > 6*255)  string_dots= 6*255+1;
  scroll_delay = SPEED;
  /*
  Serial.println();
  Serial.println();
  Serial.println("start");
  */
}

//message disp and scroll 
void disp_panel() {
  if(cursor_x-- >= -string_dots){
    matrix.clear();
    matrix.setCursor(cursor_x,0);
    matrix.print(msg);
    matrix.writeDisplay();
    delay(scroll_delay);
  }else{
    cursor_x = 15;
    if(strlen(rcvbuffer) > 0 ){
      strcpy(msg,rcvbuffer);
      strcpy(rcvbuffer,"");     
    }
    string_dots = 6*(strlen(msg)+1);
  }
}

