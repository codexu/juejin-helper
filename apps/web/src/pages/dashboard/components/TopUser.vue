<template>
  <a-card title="贡献排行">
    <a-row :gutter="20">
      <a-col
        :span="isMobile ? 24 : 12"
        v-for="(col, colIndex) in topUserCols"
        :key="colIndex"
      >
        <a-list :data-source="col">
          <template #renderItem="{ item, index }">
            <a-list-item :key="item.id">
              <template #actions>
                <a-badge
                  :number-style="{ backgroundColor: '#52c41a' }"
                  :count="item.contribution"
                  :overflow-count="999999"
                />
              </template>
              <a-list-item-meta>
                <template #title>
                  <trophy-two-tone
                    class="mr-2"
                    v-if="index + 1 + colIndex * col.length === 1"
                  />
                  <gift-two-tone
                    class="mr-2"
                    v-else-if="index + 1 + colIndex * col.length === 2"
                  />
                  <like-two-tone
                    class="mr-2"
                    v-else-if="index + 1 + colIndex * col.length === 3"
                  />
                  <span class="mr-1" v-else>
                    {{ index + 1 + colIndex * col.length }}.
                  </span>
                  <a :href="`https://juejin.cn/user/${item.userId}`" target="_blank">
                    {{ item.username }}
                  </a>
                </template>
                <template #description>
                  <a-space>
                    <span>点赞总数：{{ item.userArticleLike + item.userPinLike }}</span>
                  </a-space>
                </template>
                <template #avatar>
                  <a-avatar
                    class="borderd"
                    :src="item.avatar"
                    :size="46"
                    shape="square"
                  />
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </a-col>
    </a-row>
  </a-card>
</template>

<script lang="ts" setup>
import { TrophyTwoTone, GiftTwoTone, LikeTwoTone } from '@ant-design/icons-vue';
import device from 'current-device';
import useStore from '../store';
// 判断是否是移动端
const isMobile = device.mobile();
const store = useStore();

const topUserCols = computed(() => {
  // 将数据分成两列
  const arr = store.statistics.topUser;
  const len = arr.length;
  const half = Math.ceil(len / 2);
  const left = arr.slice(0, half);
  const right = arr.slice(half, len);
  if (isMobile) {
    return [left];
  }
  return [left, right];
});
</script>
