import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-web-cam',
  templateUrl: './web-cam.component.html',
  styleUrls: ['./web-cam.component.scss']
})
export class WebCamComponent implements OnInit, AfterViewInit {

  @ViewChild('videoEle') videoEle!: any;
  audioDeviceList: any = [];
  vedioDeviceList: any = [];
  selectedAudioDevice: any;
  selectedVedioDevice: any;
  mainStream: any;
  constructor() {
  }
  ngAfterViewInit(): void {
    this.checkWhetherUserHasGivenPermissionOrNot()
  }
  ngOnInit(): void {
  }
  async checkWhetherUserHasGivenPermissionOrNot() {
    await navigator.mediaDevices.enumerateDevices()
      .then((devices) => {
        if (!devices[0].label) {
          this.getPermissionFromUser();
        } else {
          this.getListOfVedioAndAudioDevices();
        }
      });
  }
  async getPermissionFromUser() {
    // Access the webcam stream
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(async (mediaStream) => {
        console.log('mediaStream', mediaStream);
        await mediaStream.getTracks().forEach(function (track) {
          track.stop();
        });
        this.getListOfVedioAndAudioDevices();
      })
      .catch((error) => {
        console.error("Error accessing the webcam stream: ", error);
      });
  }
  getListOfVedioAndAudioDevices() {
    this.populateCameraSelect();
    this.populateAudioSelect();
    this.changeDevice();
  }
  // Function to get the list of available video devices
  getVideoDevices() {
    return navigator.mediaDevices.enumerateDevices()
      .then(function (devices) {
        return devices.filter(function (device) {
          return device.kind === 'videoinput';
        });
      });
  }

  // Function to get the list of available audio devices
  getAudioDevices() {
    return navigator.mediaDevices.enumerateDevices()
      .then(function (devices) {
        return devices.filter(function (device) {
          return device.kind === 'audioinput';
        });
      });
  }

  // Function to populate the camera select dropdown with available video devices
  populateCameraSelect() {
    this.getVideoDevices().then((devices) => {
      this.vedioDeviceList = devices;
      this.selectedVedioDevice = this.vedioDeviceList[0].groupId;
    });
  }

  // Function to populate the audio select dropdown with available audio devices
  populateAudioSelect() {
    this.getAudioDevices().then((devices) => {
      this.audioDeviceList = devices;
      this.selectedAudioDevice = this.audioDeviceList[0].groupId;
    });
  }
  changeDevice() {
    // Access the selected camera and audio devices
    const constrain = {
      video: {
        deviceId: this.selectedVedioDevice,
        width: { min: 1024, ideal: 1280, max: 1920 },
        height: { min: 576, ideal: 720, max: 1080 },
      },
      audio: { deviceId: this.selectedAudioDevice }
    };
    this.handler(constrain);
  }
  // Function to stop the video stream
  stopAllActive() {
    // Stop all tracks in the video stream
    if (this.mainStream && this.mainStream.getTracks) {
      this.mainStream.getTracks().forEach((track: any) => {
        track.stop();
      });
    }
  }
  vedioMethod(condition: boolean, kind: 'audio' | 'video') {
    if (!condition) {
      this.mainStream.getTracks().forEach((track: any) => {
        if (track.kind === kind) {
          track.stop();
        }
      });
    } else {
      this.changeDevice()
    }
  }
  handler(constrain: any) {
    // Access the selected camera and audio devices
    navigator.mediaDevices.getUserMedia(constrain).then((mediaStream) => {
      this.streamPublisher(mediaStream);
    }).catch((error) => {
      console.log('asdfasdfasfasfd', error)
    })
  }
  streamPublisher(stream: any) {
    // Assign the new stream to the video element
    this.videoEle.nativeElement.srcObject = stream;
    this.mainStream = stream;
  }
  // Function to take a snapshot from the video stream
   takeSnapshot() {
    var videoElement = this.videoEle.nativeElement;
    // var canvas = document.getElementById('canvas');
    var canvas = document.createElement('canvas');
    var context: any = canvas.getContext('2d');

    // Set the canvas dimensions to match the video stream
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    // Draw the current frame of the video stream onto the canvas
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Get the snapshot image data as a base64-encoded URL
    var snapshotData = canvas.toDataURL('image/png');

    // Create an <a> element and set its attributes for downloading the snapshot
    var downloadLink = document.createElement('a');
    downloadLink.href = snapshotData;
    downloadLink.download = 'snapshot.png';

    // Append the download link to the body and click it programmatically to trigger the download
    document.body.appendChild(downloadLink);
    downloadLink.click();

    // Remove the download link from the body
    document.body.removeChild(downloadLink);
}
}
