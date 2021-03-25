<template lang="pug">
  .slide-verify(ref="drag", :class="{'slide-verify-success': verified }")
    .verify-box(v-show="!verified")
      //- .img-captch(v-show="showImgCaptch", v-loading="captchLoading")
      .img-captch(v-show="showImgCaptch")
        canvas(:width="w" :height="h" id="bg-img")
        canvas(:width="w" :height="h" id="block-img")
        i(class="captch-close icon el-icon-close", @click="showImgCaptch = false")
        i(class="captch-refresh icon el-icon-refresh-right", @click="refreshCanvas")
      .drag-bg
      .drag-text
        span {{ confirmWords }}
        span.move-cursor
      .handler(
        ref="moveDiv",
        @mousedown="mouseDown($event)",
        :class="{ handler_ok_bg: confirmSuccess }"
      )
        i.move-slider(v-show="captchStaus == 1")
        i.move-dark-slider(v-show="captchStaus == 2")
        i.move-error-slider(v-show="captchStaus == 3")

    div.success(v-show="verified")
      //- axzo-svg(svg-name="verified-success",class="verified-svg")
      span 验证成功 
</template>

<script>

export default {
  name: "slide-verify",
  components: {},
  props:{
    // 当前滑动成功/失败
    verified: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      beginClientX: 0 /*距离屏幕左端距离*/,
      mouseMoveState: false /*触发拖动状态  判断*/,
      maxWidth: "" /*拖动最大宽度，依据滑块宽度算出来的*/,
      confirmWords: "拖动滑块验证" /*滑块文字*/,
      confirmSuccess: false, /*验证成功判断*/
      showImgCaptch: false,
      captchLoading: false,
      captchStaus: 1,
      puzzleImgList: [
        // "http://jingnian.top/assets/img/blog-bg.jpg",
        ""
      ],
      l: 35, // 滑块边长
      r: 8, // 滑块半径
      w: 395, // canvas宽度
      h: 175, // canvas高度
      PI: Math.PI,
      blockDom: {}, // 小拼图DOM元素
      bgDom: {}, // 拼图背景DOM元素
      position: {}, //滑块的初始位置 x,y
    };
  },
  created() {
    const { l, r} = this;
    this.L = l + r * 2; // 滑块实际边长
    // 随机创建滑块的位置
    this.getRandomNumberByRange()
  },
  mounted() {
    this.$nextTick(() => {
      this.initDOM()
      this.initImg()
      this.removeClass()
    });
  },
  beforeDestroy(){
    this.handlerDom.removeEventListener("mouseup", () => {});
    this.htmlDom.removeEventListener("mousemove", () => {});
  },
  methods: {
    // 初始话dom操作需要的元素
    initDOM() {
      const {
        $refs: {
          drag: { clientWidth: dragWidth },
          moveDiv: { clientWidth: moveDivWidth}
        }
      } = this

      //获取需要操作的DOM元素
      this.htmlDom = document.getElementsByTagName("html")[0]
      this.dragTextDom = document.querySelector('.drag-text')
      this.handlerDom = document.querySelector('.handler')
      this.dragBgDom = document.querySelector('.drag-bg')
      this.maxWidth = dragWidth - moveDivWidth;
      this.handlerDom.addEventListener("mouseup", this.moseUp);
      this.htmlDom.addEventListener("mousemove", this.mouseMove);
    },
    refreshCanvas(){
      this.cleanCanvas()
      this.initImg()
    },
    // 初始化canvas需要的数据
    initImg() {
      const { r, w, h, L } = this;
      const bgDom = document.getElementById("bg-img");
      const blockDom = document.getElementById("block-img");
      const canvasCtx = bgDom.getContext("2d");
      const blockCtx = blockDom.getContext("2d");
      const img = new Image();

      this.blockDom = blockDom
      this.bgDom = bgDom
      this.captchLoading = true

      img.src = this.getRandomImg();
      img.crossOrigin = "";
      img.onload = () => {
        canvasCtx.drawImage(img, 0, 0, w, h);
        blockCtx.drawImage(img, 0, 0, w, h);
        const y = this.y - r * 2 + 2;
        const ImageData = blockCtx.getImageData(this.x, y, L, L);
        blockDom.width = L;
        blockCtx.putImageData(ImageData, 0, y);
        this.captchLoading = false
        // 随机创建滑块的位置
      };
      this.draw(canvasCtx, "fill", this.x, this.y);
      this.draw(blockCtx, "clip", this.x, this.y);
    },
    draw(ctx, operation, x, y) {
      const { l, r, PI } = this;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + l / 2, y);
      ctx.arc(x + l / 2, y - r + 2, r, 0, 2 * PI);
      ctx.lineTo(x + l / 2, y);
      ctx.lineTo(x + l, y);
      ctx.lineTo(x + l, y + l / 2);
      ctx.arc(x + l + r - 2, y + l / 2, r, 0, 2 * PI);
      ctx.lineTo(x + l, y + l / 2);
      ctx.lineTo(x + l, y + l);
      ctx.lineTo(x, y + l);
      ctx.lineTo(x, y);
      ctx.fillStyle = "#fff";
      ctx[operation]();
      ctx.beginPath();
      ctx.arc(x, y + l / 2, r, 1.5 * PI, 0.5 * PI);
      ctx.globalCompositeOperation = "xor";
      ctx.lineWidth = 2;
      ctx.fill();
    },
    // 获取随机的图片
    getRandomImg() {
      const { puzzleImgList } = this
      const index = Math.ceil(Math.random() * puzzleImgList.length - 1)
      return puzzleImgList[index]
    },
    // 获取随机的坐标点
    getRandomNumberByRange() {
      const xstart = this.L + 10, xend = this.w - (this.L + 10)
      const ystart = 10 + this.r * 2, yend = this. h - (this.L + 10)
      this.x = Math.round(Math.random() * (xend - xstart) + xstart)
      this.y = Math.round(Math.random() * (yend - ystart) + ystart)
    },
    // 清除画布
    cleanCanvas() {
      const bgWidth = this.bgDom.width
      this.bgDom.width = bgWidth;
      this.blockDom.width = bgWidth;
    },
    //验证成功函数  
    slideVerified() {
      this.captchStaus = 1
      this.confirmSuccess = true;
      this.confirmWords = "验证通过";
      this.dragTextDom.style.color = "#fff";
      this.handlerDom.style.left = this.maxWidth + "px";
      this.dragBgDom.style.width = this.maxWidth + "px";

      this.removeEvent()
      this.$emit('update:verified', true)
    },
    //mousedown 事件
    mouseDown: function(e) {
      if (!this.confirmSuccess) {
        e.preventDefault && e.preventDefault(); //阻止文字选中等 浏览器默认事件
        this.dragBgDom.style.border = "1px solid #22BB62"
        this.dragBgDom.style.background = '#E9F8EF'
        this.captchStaus = 2
        this.showImgCaptch = true
        this.mouseMoveState = true;
        this.beginClientX = e.clientX
        this.position = {
          x: e.clientX,
          y: e.clientY
        }
      }
    },
    //mousemove事件
    mouseMove(e) {
      if(!this.mouseMoveState) return
      const {  position: { x } } = this
      const { clientX, clientY } = e
      const result = clientX - this.beginClientX;
     // 横向坐标点界限值
      if(x > clientX || x + 350 < clientX){
        this.checkFailure()
        return false
      }
      //纵向坐标界限值
      if(clientY < 560 || clientY > 660){
        this.checkFailure()
        return false
      }
      this.handlerDom.style.left = result + "px"; 
      this.dragBgDom.style.width = result + "px";
      this.blockDom.style.left = (result <= 2 ? 2 : result) + "px"
    },
    //mouseup事件
    moseUp(e) {
      const { x: target } = this 
      const fault = 2
      const x = e.clientX - this.beginClientX;
      const result = Math.abs(target - x)

      if(result <= fault ){
        // 在误差值以内，则校验成功
        this.slideVerified();
        return
      }
      this.checkFailure()
    },
    // 校验失败的处理逻辑 
    checkFailure() {
      this.captchStaus = 3
      this.dragBgDom.style.border = "1px solid #FF5D00"
      this.dragBgDom.style.background = "#FFEEE5"

      this.getRandomNumberByRange()
      this.cleanCanvas()
      this.initImg()

      this.handlerDom.classList.add('handler-move')
      this.dragBgDom.classList.add('drag-move')

      this.blockDom.style.left = "2px"
      this.mouseMoveState = false;
    },
    // 动画结束后移除类
    removeClass(){
      this.handlerDom.addEventListener('animationend', (e)=>{
        const { target } = e
        target.classList.remove("handler-move")
        target.style.left = '-1px'
        this.captchStaus = 1
      })

      this.dragBgDom.addEventListener('animationend', (e)=>{
        const { target } = e
        target.classList.remove("drag-move")
        target.style.width = '0px'
        target.style.border = 'none'
      })
    },
    removeEvent(){
      if (window.addEventListener) {
        this.htmlDom.removeEventListener("mousemove", this.mouseMove);
        this.handlerDom.removeEventListener("mouseup", this.moseUp);
      } else {
        this.htmlDom.removeEventListener("mousemove", () => {});
        this.handlerDom.removeEventListener("mouseup", () => {});
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@keyframes move {
  from {
    left: 0;
  }
  to {
    left: 95px;
  }
}

@keyframes handler_move {
  to {
    left: 0;
  }
}

@keyframes drag_move {
  to {
    width: 0;
  }
}

// 滑块移动动画
.handler-move {
  animation: handler_move .5s 1;
}
.drag-move {
  animation: drag_move .5s 1;
}

.slide-verify-success {
  display: flex;
  justify-content: center;
  width: 400px;
  background: #E9F8EF;
  border: 1px solid #22BB62;
  color: #22BB62 !important;
  box-sizing: border-box;
  .success {
    .verified-svg {
      transform: translateY(3px)
    }
    > span {
      margin-left: 10px;
    }
  }
}
.slide-verify {
  margin-top: 15px;
  width: 400px;
  height: 46px;
  box-sizing: border-box;
  border: 1px solid #E9ECF5;
  background: #f4f4f4;
  font-size: 16px;
  line-height: 46px;
  color: #a9a9a9;
  .verify-box {
    position: relative;
    height: 46px;
    .img-captch {
      position: absolute;
      left: -1px;
      bottom: 46px;
      width: 400px;
      height: 180px;
      z-index: 99;
      background: #ffffff;
      border: 1px solid #E9ECF5;
      box-sizing: border-box;
      padding: 2px;
      #block-img {
        position: absolute;
        top: 2px;
        z-index: 99;
      }
      > i {
        display: inline-block;
        width: 20px;
        font-size: 16px;
        position: absolute;
        top: 4px;
        right: 4px;
        text-align: center;
        line-height: 20px;
        cursor: pointer;
        color: #ffffff;
        background: rgba($color: #000000, $alpha: 0.2);
        border-radius: 3px;
        &:hover {
          transform: scale(1.1);
        }
      }
      .captch-refresh {
        right: 30px;
      }

    }
    .drag-bg {
      background-color: #E9F8EF;
      border-right: none !important;
      box-sizing: border-box;
      top: -1px;
      left: 0;
      height: 46px;
      width: 0px;
      position: absolute;
      z-index: 99;
    }
    .drag-text {
      position: relative;
      margin-left: 52px;
      user-select: none;
      .move-cursor {
        display: inline-block;
        position: absolute;
        left: 0;
        bottom: 15px;
        background: rgba($color: #ffffff, $alpha: 0.7);
        height: 20px;
        width: 3px;
        animation: move 1.8s infinite;
      }
    }
    .handler {
      box-sizing: border-box;
      border: 1px solid #E9ECF5;
      width: 46px;
      height: 44px;
      position: absolute;
      left: 0;
      top: 0;
      cursor: pointer;
      border-radius: 5px;
      z-index: 99;
      > i {
        display: inline-block;
        margin-top: -1px;
        width: 46px;
        height: 44px;
      }
      .move-slider {
        background: url("~@/assets/slider.png");
      }
      .move-dark-slider {
        background: url("~@/assets/dark-slider.png");
      }
      .move-error-slider {
        background: url("~@/assets/error-slider.png");
      }
    }
  }
}
</style>