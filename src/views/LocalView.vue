<template>
  <div class="local-view">
    <el-empty
      v-if="!currentChannel"
      description="请先加入频道"
      :image-size="200"
      style="margin-top: 80px"
    ></el-empty>

    <el-card v-else>
      <template #header>
        <div class="view-header">
          <h2>频道资源</h2>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <el-tab-pane label="视频合集" name="video">
          <el-empty
            v-if="collection.length === 0"
            @click="addCollection"
            description="该频道暂无合集，点击新增..."
            :image-size="200"
          ></el-empty>

          <el-row v-else :gutter="20">
            <div class="collection-item-add">
              <el-button @click="addCollection" type="primary">
                <el-icon class="add-icon"><Plus /></el-icon>
                &nbsp;新增合集
              </el-button>
            </div>
            <el-scrollbar
              wrap-style="height:calc(100vh - 324px);width:100%;padding:16px;"
            >
              <div
                class="collection-item"
                v-for="(coll, index) in collection"
                :key="index"
                :xs="24"
                :sm="12"
                :md="8"
                :lg="6"
              >
                <el-card
                  class="video-card"
                  :body-style="{ padding: '0px' }"
                  shadow="hover"
                  @click="openCollection(coll)"
                >
                  <div class="video-thumbnail">
                    <el-image
                      v-if="coll.thumb"
                      :src="coll.thumb"
                      :alt="coll.title"
                      fit="contain"
                    ></el-image>
                    <el-image
                      v-else
                      src="/logo.png"
                      :alt="coll.title"
                      fit="contain"
                    ></el-image>
                  </div>
                  <div class="video-info">
                    <h3>{{ coll.title }}({{ coll.items }}集)</h3>
                    <div class="video-actions">
                      {{ new Date(coll.updatetime * 1000).toLocaleString() }}
                    </div>
                    <el-text class="video-path" truncated>
                      <span class="author">
                        {{ coll.author }}
                      </span>
                    </el-text>
                  </div>
                </el-card>
              </div>
            </el-scrollbar>
          </el-row>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 其他对话框保持不变 -->
    <el-dialog
      class="player-dialog"
      :close-on-click-modal="false"
      v-model="showPlayer"
      height="400px"
      fullscreen
      :show-close="false"
    >
      <VideoPlayer
        v-if="showPlayer"
        :default-current="currentVideo"
        @on-close="showPlayer = false"
      ></VideoPlayer>
    </el-dialog>

    <!-- 添加合集对话框 -->
    <el-dialog
      v-model="showCollectionDialog"
      title="添加新合集"
      width="30%"
      :close-on-click-modal="false"
    >
      <el-tabs v-model="collectionCreateMode">
        <el-scrollbar wrap-style="height:340px">
          <el-tab-pane label="新建" name="manual">
            <el-form :model="collectionForm" label-width="80px">
              <el-form-item label="名称" required>
                <el-input
                  v-model="collectionForm.title"
                  placeholder="请输入合集名称"
                ></el-input>
              </el-form-item>

              <el-form-item label="描述">
                <el-input
                  v-model="collectionForm.description"
                  placeholder="请输入合集描述"
                ></el-input>
              </el-form-item>

              <!-- <el-form-item label="封面图"> -->
              <!-- <el-upload
                  class="cover-uploader"
                  action="#"
                  :auto-upload="false"
                  :show-file-list="false"
                  :on-change="handleCoverChange"
                >
                  <div
                    v-if="collectionForm.coverUrl"
                    class="cover-preview-container"
                  >
                    <img :src="collectionForm.coverUrl" class="cover-preview" />
                    <div
                      class="cover-delete-icon"
                      @click.stop="removeCoverImage"
                    >
                      <el-icon><Delete /></el-icon>
                    </div>
                  </div>
                  <el-icon v-else class="cover-uploader-icon"><Plus /></el-icon>
                </el-upload> -->
              <!-- <div class="cover-tip">暂无</div> -->
              <!-- </el-form-item> -->
            </el-form>
          </el-tab-pane>
        </el-scrollbar>
      </el-tabs>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCollectionDialog = false">取消</el-button>
          <el-button
            type="primary"
            @click="saveCollection()"
            :loading="isadding"
            :disabled="isadding"
          >
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 添加查看合集内容的对话框 -->
    <el-dialog
      v-model="showCollectionVideosDialog"
      title=""
      width="70%"
      class="collection-videos-dialog"
      :show-close="false"
      @close="onCollectionClosed"
    >
      <div class="title">
        {{ currentCollection.title }}

        <el-icon class="add-item" @click="handleAddItem"><Histogram /></el-icon>

        <!-- <el-button class="add-to-list" @click="add2list"
          >添加到播放列表结尾</el-button
        > -->
        <el-button class="clear-add-to-list" @click="clearadd2list"
          >清空播放列表并添加当前所有剧集</el-button
        >
      </div>
      <el-empty
        v-if="!currentCollection || currentCollection.zyhjnr.length === 0"
        description="该合集暂无视频"
        :image-size="200"
      ></el-empty>

      <el-scrollbar v-else wrap-style="height:420px;width:calc(100% - 0px);">
        <div
          class="video-item"
          v-for="(video, index) in currentCollection.zyhjnr"
          :key="index"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
        >
          <el-card
            class="video-card"
            :body-style="{ padding: '0px' }"
            shadow="hover"
            @click="playVideo(video, 'collection')"
          >
            <div class="resource-item">
              <!-- <el-image
                :src="video.thumbnail || '/placeholder.jpg'"
                :alt="video.title"
                fit="contain"
              ></el-image> -->
              <div class="play-icon-overlay">
                <el-icon class="play-icon"><VideoPlay /></el-icon>
              </div>
            </div>
            <div class="video-info">
              <h3>{{ video.title || "暂无" }}</h3>
              <!-- <span>{{ video.text }}</span> -->
              <div class="video-actions"></div>
              <!-- <div class="time">{{ video.time }}</div> -->
            </div>
          </el-card>
        </div>
      </el-scrollbar>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCollectionVideosDialog = false"
            >关闭</el-button
          >
        </span>
      </template>
    </el-dialog>

    <!-- 添加资源对话框 -->
    <el-dialog
      v-model="addDialog"
      title="资源管理"
      width="80%"
      :close-on-click-modal="false"
    >
      <div class="add-resource-content">
        <el-tabs v-model="addMode" class="demo-tabs">
          <el-tab-pane label="单条新增" name="one">
            <el-scrollbar :wrap-style="{ height: '300px' }">
              <div class="video-list-item header">
                <div class="title">资源标题</div>
                <div class="origin">源网站地址</div>
                <div class="real">视频源地址提取</div>
                <div class="type">视频源类型(可不选)</div>
                <div class="operation">操作</div>
              </div>

              <VirtList
                itemKey="origin"
                :list="currentCollection.zyhjnr"
                :minSize="20"
              >
                <template #default="{ itemData }">
                  <div class="video-list-item">
                    <el-input
                      class="title"
                      clearable
                      v-model="itemData.title"
                      type="textarea"
                      :rows="2"
                      placeholder="请输入资源标题"
                    ></el-input>
                    <el-input
                      class="origin"
                      type="textarea"
                      :rows="2"
                      clearable
                      v-model="itemData.origin"
                      placeholder="请输入资源标题"
                    ></el-input>

                    <el-input
                      class="real"
                      clearable
                      type="textarea"
                      :rows="2"
                      v-model="itemData.real"
                      placeholder="请输入资源标题"
                    ></el-input>

                    <el-select
                      class="type"
                      v-model="itemData.type"
                      placeholder="资源格式（可留空）"
                      clearable
                    >
                      <el-option label="网页" value="iframe"></el-option>
                      <el-option label="mp4" value="mp4"></el-option>
                      <el-option label="m3u8" value="m3u8"></el-option>
                      <el-option label="flv" value="flv"></el-option>
                      <el-option label="avi" value="avi"></el-option>
                      <el-option label="wmv" value="wmv"></el-option>
                      <el-option label="mov" value="mov"></el-option>
                      <el-option label="ogg" value="ogg"></el-option>
                      <el-option label="mkv" value="mkv"></el-option>
                      <el-option label="mkv" value="mkv"></el-option>
                      <el-option label="ts" value="ts"></el-option>
                    </el-select>

                    <div class="operation">
                      <el-button
                        type="danger"
                        @click="deleteResourceItem(itemData)"
                      >
                        Delete</el-button
                      >
                    </div>
                  </div>
                </template>
              </VirtList>
            </el-scrollbar>
          </el-tab-pane>

          <el-tab-pane label="批量新增" name="batch">
            <el-form-item label="批量项目">
              <el-input
                type="textarea"
                placeholder="此项数据可以通过官方插件复制而得"
                v-model="rawItems"
                :rows="8"
              >
              </el-input>
            </el-form-item>

            <el-form-item label="是否用此数据强制覆盖原本资源列表">
              <el-switch v-model="force"></el-switch>
            </el-form-item>
          </el-tab-pane>
        </el-tabs>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <el-button
            v-show="addMode == 'one'"
            class="add-new-resource"
            type="primary"
            @click="addNewResource"
            >新增一条</el-button
          >

          <el-button @click="addDialog = false">取消</el-button>
          <el-button type="primary" @click="handleAddConfirm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <div :class="['drawer', showWorklistDrawer ? '' : 'drawer-hide']">
      <div class="title">大家想看的</div>
      <el-empty v-if="worklist.length === 0" description="暂无工单"></el-empty>

      <div v-else>
        <el-scrollbar :wrap-style="{ height: 'calc(100vh - 180px)' }">
          <div v-for="(item, idx) in worklist" :key="idx" class="work-item">
            <el-card>
              <template #header>
                <div class="view-header">
                  <h2>{{ item.title }}</h2>
                </div>
              </template>

              <p>{{ item.description }}</p>
              <p>{{ new Date(item.updatetime * 1000).toLocaleString() }}</p>

              <el-tag :type="item.yijiejue == 2 ? 'success' : 'warning'">{{
                item.yijiejue == 0 ? "待解决" : "已解决"
              }}</el-tag>
            </el-card>
          </div>
        </el-scrollbar>
      </div>

      <div class="footer">
        <el-button type="primary" @click="requestwork">我想找</el-button>
      </div>

      <div
        class="kkk"
        @click="
          () => {
            showWorklistDrawer = !showWorklistDrawer;
          }
        "
      >
        <img src="/logo.png" alt="" />
      </div>
    </div>

    <!-- 新建工单对话框 -->
    <el-dialog v-model="showRequestWorkDialog" title="新建工单" width="400px">
      <el-form :model="requestWorkForm" label-width="80px">
        <el-form-item label="标题" required>
          <el-input
            v-model="requestWorkForm.subject"
            placeholder="请输入需求标题"
          ></el-input>
        </el-form-item>
        <el-form-item label="描述" required>
          <el-input
            type="textarea"
            v-model="requestWorkForm.description"
            placeholder="请填写详细描述"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showRequestWorkDialog = false">取消</el-button>
        <el-button type="primary" @click="handleRequestWorkConfirm"
          >确认</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, onActivated, nextTick } from "vue";
import {
  VideoPlay,
  Delete,
  Plus,
  Check,
  CirclePlusFilled,
  Histogram,
} from "@element-plus/icons-vue";
import { ElMessageBox, ElMessage } from "element-plus";
import { VirtList } from "vue-virt-list";
import Collection from "../tool/collection";
import PlayerList from "../tool/playerList";
import Channel from "../api/channel";
import Config from "../tool/config";
import VideoPlayer from "../components/VideoPlayer.vue";
import { DEFAULT_COLLECTION_COVER } from "../const/const";

const activeTab = ref("video");
const showPlayer = ref(false);
const currentVideo = ref({});
const playMode = ref("history");
const showCollectionDialog = ref(false);
const collectionForm = ref({
  title: "",
  description: "",
  coverUrl: "",
});
const showSelectCollectionDialog = ref(false);
const selectedCollection = ref(null);
const videoToAdd = ref(null);
const showCollectionVideosDialog = ref(false);
const currentCollection = ref(null);
const collection = ref([]);
const isTitleEditing = ref(false);
const originalTitle = ref("");
const collectionCreateMode = ref("manual");
const importing = ref(false);
const addDialog = ref(false);
const isadding = ref(false);
const addMode = ref("one");
const force = ref(false);
const showWorklistDrawer = ref(false);
const showRequestWorkDialog = ref(false);

const requestWorkForm = ref({
  subject: "",
  description: "",
});

const addForm = ref({
  title: "",
  origin: "",
  real: "",
  type: "",
});

const rawItems = ref("");

const requestwork = () => {
  showRequestWorkDialog.value = true;
};

const onCollectionClosed = async () => {
  //
  await getChannelCollections();
};

const deleteResourceItem = (itemdata) => {
  if (!currentCollection.value || !currentCollection.value.zyhjnr) return;
  ElMessageBox.confirm("确定要删除该资源吗？", "删除确认", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    const idx = currentCollection.value.zyhjnr.indexOf(itemdata);
    if (idx !== -1) {
      currentCollection.value.zyhjnr.splice(idx, 1);
    }
  });
};

const addNewResource = () => {
  if (!currentCollection.value || !currentCollection.value.zyhjnr) return;
  currentCollection.value.zyhjnr.push({
    title: "",
    origin: "",
    real: "",
    type: "",
  });
  // 自动滚动到最后
  nextTick(() => {
    const virtList = document.querySelector(
      ".add-resource-content .el-scrollbar__wrap"
    );
    if (virtList) {
      virtList.scrollTop = virtList.scrollHeight;
    }
  });
};

const handleRequestWorkConfirm = async () => {
  if (requestWorkForm.value.description && requestWorkForm.value.subject) {
    const config = await Config.getConfiguration();
    await Channel.pushwork(config.channel, requestWorkForm.value);
    showRequestWorkDialog.value = false;
    requestWorkForm.value = { subject: "", description: "" };
    await getWorkList();
  }
};

const clearadd2list = async () => {
  await PlayerList.pushVideo(currentCollection.value.zyhjnr, true);
};

const add2list = async () => {
  await PlayerList.pushVideo(currentCollection.value.zyhjnr);
};

// 处理新增确认
const handleAddConfirm = async () => {
  try {
    if (addMode.value === "one") {
      await Channel.pushItemsToCollection(
        JSON.stringify(currentCollection.value.zyhjnr),
        currentCollection.value.id,
        true
      );
    }

    if (addMode.value === "batch") {
      await Channel.pushItemsToCollection(
        rawItems.value,
        currentCollection.value.id,
        force.value
      );
      rawItems.value = "";
    }
    // await PlayerList.pushVideo(addForm.value, currentCollection.value.id);

    const data = await Channel.getCollectionDetails(currentCollection.value.id);
    currentCollection.value = data;
    nextTick();
    addDialog.value = false;
  } catch (error) {
    ElMessage.error(error);
  }
};

const handleAddItem = () => {
  addDialog.value = true;
};

async function playVideo(video, type) {
  playMode.value = type;
  currentVideo.value = video;
  await PlayerList.pushVideo(video);
  showPlayer.value = true;
}

function addCollection() {
  isadding.value = false;
  showCollectionDialog.value = true;
  collectionCreateMode.value = "manual";
  collectionForm.value = {
    title: "",
    description: "",
    coverUrl: DEFAULT_COLLECTION_COVER,
  };
}

// 处理封面图片变更
function handleCoverChange(file) {
  const isImage = file.raw.type.startsWith("image/");
  if (!isImage) {
    ElMessage.error("只能上传图片文件!");
    return;
  }

  // 限制文件大小为 5MB
  const isLt2M = file.size / 1024 / 1024 < 5;
  if (!isLt2M) {
    ElMessage.error("图片大小不能超过 5MB!");
    return;
  }

  // 将文件转换为 Base64 格式
  const reader = new FileReader();
  reader.readAsDataURL(file.raw);
  reader.onload = () => {
    collectionForm.value.coverUrl = reader.result;
  };
}

async function openCollection(coll) {
  const data = await Channel.getCollectionDetails(coll.id);
  currentCollection.value = data;
  showCollectionVideosDialog.value = true;
}

const updateCollectionTitle = async () => {
  if (!currentCollection.value.title.trim()) {
    ElMessage.warning("标题不能为空");
    return;
  }

  await Collection.updateCollection(currentCollection.value);
  collection.value = await Collection.getCollections();
  originalTitle.value = currentCollection.value.title;
  isTitleEditing.value = false;
  ElMessage.success("标题更新成功");
};

// 删除封面图片
function removeCoverImage(e) {
  e.stopPropagation(); // 阻止事件冒泡
  collectionForm.value.coverUrl = "";

  // 如果有创建的对象URL，需要释放它
  if (
    collectionForm.value.coverUrl &&
    collectionForm.value.coverUrl.startsWith("blob:")
  ) {
    URL.revokeObjectURL(collectionForm.value.coverUrl);
  }
}

// 保存合集
async function saveCollection() {
  if (!collectionForm.value.title.trim()) {
    ElMessage.warning("请输入合集名称");
    return;
  }
  const newCollection = {
    title: collectionForm.value.title,
    description: collectionForm.value.description,
    coverUrl: "",
  };
  isadding.value = true;
  const success = await Channel.addCollection(newCollection);
  if (success) {
    getChannelCollections();
    collectionForm.value = {
      title: "",
      description: "",
      coverUrl: "",
    };
    showCollectionDialog.value = false;
  }
  isadding.value = false;
}

const currentChannel = ref("");

const getChannelCollections = async (channelId) => {
  if (!channelId) {
    const config = await Config.getConfiguration();
    channelId = config.channel;
  }

  currentChannel.value = channelId;
  const res = await Channel.getChannelCollections(channelId);
  if (res) {
    collection.value = res;
  } else {
    collection.value = [];
  }
};

const worklist = ref([]);

const getWorkList = async (channelId) => {
  if (!channelId) {
    const config = await Config.getConfiguration();
    channelId = config.channel;
  }
  worklist.value = await Channel.getWorkList(channelId);
  console.log("worklist", worklist.value);
};

onActivated(async () => {
  await getChannelCollections();
  await getWorkList();
});

onMounted(async () => {
  await getChannelCollections();
  await getWorkList();
});
</script>

<style lang="less">
.local-view {
  .el-empty {
    .el-empty__description {
      p {
        color: #4466ff;
        font-weight: 900;
      }
    }
  }
  @keyframes gzh-animate {
    0% {
      transform: rotateZ(0deg);
    }
    40% {
      transform: rotateZ(0deg);
    }
    45% {
      transform: rotateZ(25deg);
    }
    50% {
      transform: rotateZ(-25deg);
    }

    55% {
      transform: rotateZ(25deg);
    }
    60% {
      transform: rotateZ(0deg);
    }
    100% {
      transform: rotateZ(0deg);
    }
  }
  .view-header {
    h2 {
      margin: 0;
    }
  }
  > .el-card {
    background: rgba(255, 255, 255, 0.9);
  }

  .history-item,
  .collection-item,
  .video-item {
    margin: 10px;
    display: inline-block;
    width: 260px;
    cursor: pointer;
  }
  .collection-item {
    display: inline-block;
    width: 260px;
    margin: 8px;
    vertical-align: top;
    transition: transform 0.2s;
    .video-card {
      border-radius: 14px;
      box-shadow: 0 2px 4px rgba(31, 38, 135, 0.08);
      transition: box-shadow 0.2s, transform 0.2s;
      &:hover {
        transform: translateY(-6px) scale(1.01);
      }
      .video-thumbnail {
        border-radius: 14px 14px 0 0;
        overflow: hidden;
        height: 160px;
        background: #f4f6fa;
        display: flex;
        align-items: center;
        justify-content: center;
        .el-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }
      .video-info {
        padding: 16px 14px 10px 14px;
        h3 {
          font-size: 17px;
          font-weight: 600;
          margin: 0 0 8px 0;
          color: #222;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .video-actions {
          margin-top: 8px;
          font-size: 13px;
          color: #999;
          display: flex;
          justify-content: flex-end;
        }
        .video-path {
          display: block;
          margin: 5px 0 0 0;
          color: #666;
          font-size: 13px;
          .author {
            float: right;
            color: #f35804;
            font-weight: 500;
          }
        }
      }
    }
  }

  .video-card {
    height: 100%;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-5px);
    }

    .video-thumbnail {
      position: relative;
      height: 200px;
      overflow: hidden;

      .el-image {
        width: 100%;
        height: 100%;
      }

      .play-icon-overlay {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0;
        transition: opacity 0.3s;
        cursor: pointer;

        &:hover {
          opacity: 1;
        }

        .play-icon {
          font-size: 48px;
          color: white;
        }
      }
    }
    .resource-item {
      //
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: #f5f5f5;
      position: relative;
      overflow: hidden;
    }

    .video-info {
      padding: 14px;
      position: relative;

      h3 {
        margin: 0;
        font-size: 16px;
        margin-bottom: 8px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      span {
        font-size: 14px;
        color: #666;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
      }

      .video-actions {
        margin-top: 10px;
        display: flex;
        justify-content: flex-end;
      }

      .time {
        position: absolute;
        bottom: 14px;
        left: 14px;
        font-size: 12px;
        color: #999;
      }

      .copy-collection {
        margin-top: 10px;
        width: 100%;
      }
    }
  }

  .collection-item-add {
    display: inline-block;
    width: 100%;
    margin: 0 10px;
    vertical-align: top;
    .el-button {
      width: 100%;
    }
  }

  .cover-uploader {
    .cover-preview-container {
      position: relative;
      width: 178px;
      height: 178px;
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      overflow: hidden;

      .cover-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .cover-delete-icon {
        position: absolute;
        top: 0;
        right: 0;
        padding: 8px;
        background: rgba(0, 0, 0, 0.5);
        cursor: pointer;
        color: white;
      }
    }

    .cover-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
      border: 1px dashed #d9d9d9;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .cover-tip {
    font-size: 12px;
    color: #909399;
    margin-top: 5px;
  }

  .collection-select-list {
    .collection-select-item {
      display: block;
      margin-bottom: 10px;
      height: auto;

      .collection-select-content {
        display: flex;
        align-items: center;

        .collection-thumbnail {
          width: 60px;
          height: 60px;
          margin-right: 10px;
          border-radius: 4px;
        }

        .collection-title {
          flex: 1;
        }
      }
    }
  }

  .drawer {
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15),
      0 1.5px 6px rgba(0, 0, 0, 0.08);
    border-radius: 18px 0 0 18px;
    position: absolute;
    right: -300px;
    top: 0px;
    width: 260px;
    z-index: 999;
    height: calc(100% - 36px);
    background: linear-gradient(135deg, #f8fafc 60%, #e3e6eb 100%);
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 18px 18px 18px 18px;
    border: 1.5px solid #e0e0e0;
    .kkk {
      position: absolute;
      left: -48px;
      height: 48px;
      transform: translateY(-50%);
      top: 50%;
      cursor: pointer;
      z-index: -1;
      // box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      // background: #fff;
      // border: 1px solid #e0e0e0;
      transition: box-shadow 0.2s;
      width: 48px;
      animation: gzh-animate;
      animation-duration: 3s;
      animation-iteration-count: infinite;
      animation-fill-mode: both;
      &:hover img {
        opacity: 0.8;
      }
      img {
        width: 100%;
      }
    }
    .title {
      text-align: center;
      padding: 18px 0 12px 0;
      font-size: 20px;
      font-weight: 600;
      color: #333;
      letter-spacing: 1px;
    }
    .work-item {
      .el-card {
        margin-bottom: 18px;
        border-radius: 10px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transition: box-shadow 0.2s;
        &:hover {
          box-shadow: 0 6px 18px rgba(0, 0, 0, 0.13);
        }
      }
    }
    .footer {
      text-align: center;
      padding: 18px 0 0 0;
      .el-button {
        border-radius: 20px;
        font-weight: 500;
        padding: 8px 28px;
        background: linear-gradient(90deg, #ffb86c 0%, #ff7b7b 100%);
        color: #fff;
        border: none;
        box-shadow: 0 2px 8px rgba(255, 186, 108, 0.12);
        transition: background 0.2s;
        &:hover {
          background: linear-gradient(90deg, #ff7b7b 0%, #ffb86c 100%);
        }
      }
    }
  }
  .drawer-hide {
    right: 0;
  }
}

.collection-videos-dialog {
  .el-dialog__body {
    background: #f8fafc;
    border-radius: 0 0 16px 16px;
    padding: 24px 32px 16px 32px;
    height: 500px;
  }
  .title {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 24px;
    font-size: 26px;
    font-weight: 600;
    color: #333;
    position: relative;
    .add-item {
      cursor: pointer;
      margin-left: 16px;
      font-size: 22px;
      color: #888;
      transition: color 0.2s;
      &:hover {
        color: var(--el-color-primary);
      }
    }
    .add-to-list,
    .clear-add-to-list {
      font-size: 15px;
      margin-left: 18px;
      position: absolute;
      right: 0;
      top: 0;
      background: linear-gradient(90deg, #ffb86c 0%, #ff7b7b 100%);
      color: #fff;
      border-radius: 18px;
      border: none;
      padding: 6px 22px;
      box-shadow: 0 2px 8px rgba(255, 186, 108, 0.1);
      transition: background 0.2s;
      cursor: pointer;
      &:hover {
        background: linear-gradient(90deg, #ff7b7b 0%, #ffb86c 100%);
      }
    }
    // .clear-add-to-list {
    //   top: 50px;
    // }
  }
  .video-item {
    display: inline-block;
    width: 240px;
    margin: 10px 12px 18px 0;
    vertical-align: top;
    .video-card {
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(31, 38, 135, 0.08);
      transition: box-shadow 0.2s, transform 0.2s;
      &:hover {
        box-shadow: 0 6px 24px rgba(31, 38, 135, 0.16);
        transform: translateY(-4px) scale(1.03);
      }
      .resource-item {
        border-radius: 12px 12px 0 0;
        overflow: hidden;
        min-height: 60px;
        background: #f4f6fa;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .video-info {
        padding: 16px 14px 10px 14px;
        h3 {
          font-size: 16px;
          font-weight: 500;
          margin: 0 0 8px 0;
          color: #222;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .video-actions {
          margin-top: 8px;
          display: flex;
          justify-content: flex-end;
        }
      }
    }
  }
  .el-empty {
    margin: 40px 0;
  }
}
.player-dialog {
  :deep(.el-dialog__body) {
    padding: 0;
  }
}

.select-collection-dialog {
  :deep(.el-radio__input) {
    align-self: flex-start;
    margin-top: 20px;
  }
}

.add-resource-content {
  position: relative;
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(31, 38, 135, 0.06);
  padding: 8px 18px 18px 18px;
  margin-top: 10px;
  height: 380px;
  .video-list-item {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 10px 12px 10px;
    width: 100%;
    border-radius: 8px;
    border: 1px solid #e3e6eb;
    background: #fff;
    margin-bottom: 14px;
    transition: box-shadow 0.2s, border 0.2s;
    box-sizing: border-box;
    &:hover {
      box-shadow: 0 4px 16px rgba(31, 38, 135, 0.1);
      border: 1.5px solid #b3b8c3;
    }
    > div,
    .el-input,
    .el-select {
      margin: 0 6px;
    }
    .title {
      width: 220px;
    }
    .origin {
      width: 220px;
    }
    .real {
      width: 320px;
    }
    .type {
      width: 150px;
    }
    .operation {
      width: 100px;
    }
    .el-input__inner,
    .el-textarea__inner {
      border-radius: 6px;
      background: #f4f6fa;
      border: 1px solid #e3e6eb;
      transition: border 0.2s;
    }
    .el-input__inner:focus,
    .el-textarea__inner:focus {
      border: 1.5px solid #409eff;
      background: #fff;
    }
  }
  .header {
    position: sticky;
    top: 0;
    left: 0;
    z-index: 10;
    background: #e3e6eb;
    border-radius: 8px 8px 0 0;
    font-weight: 600;
    color: #333;
    box-shadow: 0 2px 8px rgba(31, 38, 135, 0.04);
    padding: 10px 0 10px 0;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    .title,
    .origin,
    .real,
    .type {
      text-align: center;
      color: #666;
      font-size: 15px;
    }
  }
}
.add-new-resource {
  float: left;
}
</style>
