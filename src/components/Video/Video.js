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
    this.btnPauseRecord.disabled = true;
    this.btnResumeRecord.disabled = true;
    this.btnStopRecord.disabled = true;

    this.initDevices();
  }

  componentDidUpdate() {
  }

  initDevices() {
    // 判断浏览器是否支持这些 API
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
      console.log("enumerateDevices() not supported.");
      return;
    }

    const that = this;

    // 枚举 cameras 和 microphones
    navigator.mediaDevices.enumerateDevices()
      .then(function (devices) {
        const audioInputOptions = [];
        const videoInputOptions = [];
        const audioOutputOptions = [];

        // 设备信息
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
    // newState.canvas.class = value;

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

  // 拍照
  take() {
    const defaultFilter = this.state.defaultFilter;
    const ctx = this.picture.getContext('2d');

    // https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/filter
    // 滤镜函数: https://developer.mozilla.org/zh-CN/docs/Web/CSS/filter-function

    if (defaultFilter === 'blur') {
      ctx.filter = 'blur(2px)';
    }
    else if (defaultFilter === 'grayscale') {
      ctx.filter = 'grayscale(1)';
    }
    else if (defaultFilter === 'invert') {
      ctx.filter = 'invert(1)';
    }
    else if (defaultFilter === 'sepia') {
      ctx.filter = 'sepia(1)';
    }
    else {
      ctx.filter = 'none';
    }

    ctx.drawImage(this.player, 0, 0, this.state.canvas.width, this.state.canvas.height);
  }

  // 保存照片
  save() {
    const url = this.picture.toDataURL(this.picture.toDataURL("image/jpeg"));
    Video.download(url, 'photo');
  }

  static download(url, fileName) {
    const oA = document.createElement('a');
    oA.download = fileName; // 设置下载的文件名，默认是'下载'
    oA.href = url;
    oA.style.display = 'none';
    document.body.appendChild(oA);
    oA.click();
    oA.remove(); // 下载之后把创建的元素删除
  }

  // 当该函数被触发后，将数据压入到 blob 中
  handleDataAvailable = e => {
    if (e && e.data && e.data.size > 0) {
      this.recordBuffer.push(e.data);
    }
  };

  // 初始化录制参数
  initRecord() {
    // 设置录制下来的多媒体格式
    const options = {
      mimeType: 'video/webm;codecs=vp8'
    };

    // 判断浏览器是否支持录制
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      console.error(`${options.mimeType} is not supported!`);
      return;
    }

    const stream = this.player.captureStream(30); // 录制帧率30FPS

    this.mediaRecorder = null;
    try {
      // 创建录制对象
      this.mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
      console.error('Failed to create MediaRecorder:', e);
    }
  }

  // 开始录制
  startRecord() {
    this.recordBuffer = [];

    if (!this.mediaRecorder) {
      this.initRecord();
    }

    if (this.mediaRecorder) {
      this.btnStartRecord.disabled = true;
      this.btnPauseRecord.disabled = false;
      this.btnResumeRecord.disabled = true;
      this.btnStopRecord.disabled = false;

      // 当有音视频数据来了之后触发该事件
      this.mediaRecorder.ondataavailable = this.handleDataAvailable;
      // 开始录制
      this.mediaRecorder.start(10);
    }
  }

  // 暂停录制
  pauseRecord() {
    this.btnPauseRecord.disabled = true;
    this.btnResumeRecord.disabled = false;

    this.mediaRecorder.pause();
  }

  // 恢复录制
  resumeRecord() {
    this.btnPauseRecord.disabled = false;
    this.btnResumeRecord.disabled = true;

    this.mediaRecorder.resume();
  }

  // 结束录制
  stopRecord() {
    this.btnStartRecord.disabled = false;
    this.btnPauseRecord.disabled = true;
    this.btnResumeRecord.disabled = true;
    this.btnStopRecord.disabled = true;

    this.mediaRecorder.stop();
  }

  // 回放录制文件
  recPlay() {
    if (!this.recordBuffer) {
      alert("尚未开始录制");
      return;
    }

    let blob = new Blob(this.recordBuffer, {type: 'video/webm'});
    this.recVideo.src = window.URL.createObjectURL(blob);
    this.recVideo.srcObject = null;
    this.recVideo.controls = true;
    this.recVideo.play();
  }

  // 下载录制文件
  downloadRecord() {
    if (!this.recordBuffer) {
      alert("尚未开始录制");
      return;
    }

    let blob = new Blob(this.recordBuffer, {type: 'video/webm'});
    let url = window.URL.createObjectURL(blob);

    Video.download(url, 'video.mp4');
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

        <label>
          滤镜:
          <select value={this.state.defaultFilter} onChange={this.handleChangeOfFilter}>
            <option value="none">无</option>
            <option value="blur">模糊(毛玻璃)</option>
            <option value="grayscale">黑白</option>
            <option value="invert">反转颜色</option>
            <option value="sepia">棕褐色</option>
          </select>
        </label>

        <button onClick={() => this.take()}>拍照</button>
        <button onClick={() => this.save()}>保存照片</button>

        <br/>

        <button ref={node => (this.btnStartRecord = node)}
                onClick={() => this.startRecord()}>
          开始录制
        </button>
        <button ref={node => (this.btnPauseRecord = node)}
                onClick={() => this.pauseRecord()}>
          暂停录制
        </button>
        <button ref={node => (this.btnResumeRecord = node)}
                onClick={() => this.resumeRecord()}>
          恢复录制
        </button>
        <button ref={node => (this.btnStopRecord = node)}
                onClick={() => this.stopRecord()}>
          结束录制
        </button>
        <button onClick={() => this.recPlay()}>回放录制文件</button>
        <button onClick={() => this.downloadRecord()}>下载录制文件</button>

        <br/>

        <video ref={node => (this.player = node)} autoPlay playsInline>您的浏览器不支持视频播放！</video>

        <canvas ref={node => (this.picture = node)}
                width={this.state.canvas.width}
                height={this.state.canvas.height}
                className={this.state.canvas.class}><p>您的浏览器不支持Canvas标签！</p></canvas>

        <video ref={node => (this.recVideo = node)}>您的浏览器不支持视频播放！</video>
      </div>
    );
  }

}
