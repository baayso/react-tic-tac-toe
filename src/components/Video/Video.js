import React, {Component} from 'react'
import './Video.css'

export default class Video extends Component {

  constructor(props) {
    super(props);

    this.gotLocalMediaStream = this.gotLocalMediaStream.bind(this);
    this.handleLocalMediaStreamError = this.handleLocalMediaStreamError.bind(this);

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
      canvas: {
        width: 1280,
        height: 720,
        class: '',
      },
      defaultFilter: '',
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

  handleChangeOfFilter = e => {
    const value = e.target.value;

    const newState = Object.assign({}, this.state);
    newState.defaultFilter = value;
    newState.canvas.class = value;

    this.setState(newState);
  };

  // 采集音视频数据
  collect(mediaStreamConstraints) {
    navigator.mediaDevices.getUserMedia(mediaStreamConstraints)
      .then(this.gotLocalMediaStream)
      .catch(this.handleLocalMediaStreamError);
  }

  gotLocalMediaStream(mediaStream) {
    this.player.srcObject = mediaStream;
  }

  handleLocalMediaStreamError(error) {
    console.log('navigator.getUserMedia error: ', error);
    console.log(this.state);
  }

  take() {
    this.picture.getContext('2d')
      .drawImage(this.player, 0, 0, this.state.canvas.width, this.state.canvas.height);
  }

  save() {
    Video.download(this.picture.toDataURL(this.picture.toDataURL("image/jpeg")));
  }

  static download(url) {
    const oA = document.createElement('a');
    oA.download = 'photo'; // 设置下载的文件名，默认是'下载'
    oA.href = url;
    document.body.appendChild(oA);
    oA.click();
    oA.remove(); // 下载之后把创建的元素删除
  }

  render() {
    this.collect(this.state.mediaStreamConstraints);

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

        <button onClick={() => this.take()}>拍照</button>
        <button onClick={() => this.save()}>保存照片</button>

        <label>
          滤镜:
          <select value={this.state.defaultFilter} onChange={this.handleChangeOfFilter}>
            <option value="none">None</option>
            <option value="blur">blur</option>
            <option value="grayscale">Grayscale</option>
            <option value="invert">Invert</option>
            <option value="sepia">sepia</option>
          </select>
        </label>

        <br/>

        <video ref={ref => (this.player = ref)} autoPlay playsInline>您的浏览器不支持视频播放！</video>

        <canvas ref={ref => (this.picture = ref)}
                width={this.state.canvas.width}
                height={this.state.canvas.height}
                className={this.state.canvas.class}><p>您的浏览器不支持Canvas标签！</p></canvas>
      </div>
    );
  }

}
