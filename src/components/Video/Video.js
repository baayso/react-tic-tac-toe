import React, {Component} from 'react'

export default class Video extends Component {

  constructor(props) {
    super(props);
    this.state = {
      mediaStreamConstraints: {
        video: {
          frameRate: {min: 20},
          width: {min: 640, ideal: 1280},
          height: {min: 360, ideal: 720},
          aspectRatio: 16 / 9,
          facingMode: "environment", // user:前置摄像头，environment:后置摄像头
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      },
      audioInput: {
        options: [],
        defaultValue: '',
      },
      videoInput: {
        options: [],
        defaultValue: '',
      },
      audioOutput: {
        options: [],
        defaultValue: '',
      },
    };
  }

  componentDidMount() {
    // 判断浏览器是否支持这些 API
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
      return;
    }

    const that = this;

    // 枚举 cameras and microphones.
    navigator.mediaDevices.enumerateDevices()
      .then(function (devices) {
        const audioInputOptions = [];
        const videoInputOptions = [];
        const audioOutputOptions = [];

        // 打印出每一个设备的信息
        devices.forEach(function (deviceInfo) {
          console.log(`${deviceInfo.kind}: ${deviceInfo.label}  id = ${deviceInfo.deviceId}`);

          if (deviceInfo.kind === 'audioinput') {
            audioInputOptions.push({value: deviceInfo.deviceId, label: deviceInfo.label});
          }
          else if (deviceInfo.kind === 'videoinput') {
            videoInputOptions.push({value: deviceInfo.deviceId, label: deviceInfo.label});
          }
          else if (deviceInfo.kind === 'audiooutput') {
            audioOutputOptions.push({value: deviceInfo.deviceId, label: deviceInfo.label});
          }
        });

        that.setState({
          audioInput: {
            options: audioInputOptions,
            defaultValue: '',
          },
          videoInput: {
            options: videoInputOptions,
            defaultValue: '',
          },
          audioOutput: {
            options: audioOutputOptions,
            defaultValue: '',
          },
        });
      })
      .catch(function (err) {
        console.log(err.name + ": " + err.message);
      });
  }

  componentDidUpdate() {
  }

  handleChangeOfAudioInput = e => {
    const value = e.target.value;

    const newState = Object.assign({}, this.state);
    newState.mediaStreamConstraints.audio.deviceId = value;
    newState.audioInput.defaultValue = value;

    this.setState(newState);
  };

  handleChangeOfVideoInput = e => {
    const value = e.target.value;

    const newState = Object.assign({}, this.state);
    newState.mediaStreamConstraints.video.deviceId = value;
    newState.videoInput.defaultValue = value;

    this.setState(newState);
  };

  handleChangeOfAudioOutput = e => {
    const value = e.target.value;

    const newState = Object.assign({}, this.state);
    newState.audioOutput.defaultValue = value;

    this.setState(newState);
  };

  // 采集音视频数据
  static collect(mediaStreamConstraints) {
    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
      .then(Video.gotLocalMediaStream)
      .catch(Video.handleLocalMediaStreamError);
  }

  static gotLocalMediaStream(mediaStream) {
    const localVideo = document.querySelector('#video');
    localVideo.srcObject = mediaStream;
  }

  static handleLocalMediaStreamError(error) {
    console.log('navigator.getUserMedia error: ', error);
  }

  render() {
    Video.collect(this.state.mediaStreamConstraints);

    const audioInputOptions = this.state.audioInput.options;
    const videoInputOptions = this.state.videoInput.options;
    const audioOutputOptions = this.state.audioOutput.options;

    const audioInputElements = audioInputOptions.map((item, i) => {
      return (
        <option key={i} value={item.value}>
          {item.label}
        </option>
      );
    });

    const videoInputElements = videoInputOptions.map((item, i) => {
      return (
        <option key={i} value={item.value}>
          {item.label}
        </option>
      );
    });

    const audioOutputElements = audioOutputOptions.map((item, i) => {
      return (
        <option key={i} value={item.value}>
          {item.label}
        </option>
      );
    });

    return (
      <div>
        <h1>Realtime communication with WebRTC</h1>

        <form>
          <label>
            音频输入设备:
            <select value={this.state.audioInput.defaultValue} onChange={this.handleChangeOfAudioInput}>
              {audioInputElements}
            </select>
          </label>

          <label>
            视频输入设备:
            <select value={this.state.videoInput.defaultValue} onChange={this.handleChangeOfVideoInput}>
              {videoInputElements}
            </select>
          </label>

          <label>
            音频输出设备:
            <select value={this.state.audioOutput.defaultValue} onChange={this.handleChangeOfAudioOutput}>
              {audioOutputElements}
            </select>
          </label>
        </form>

        <br/>

        <video id="video" autoPlay playsInline>您的浏览器不支持视频播放！</video>
      </div>
    );
  }

}
