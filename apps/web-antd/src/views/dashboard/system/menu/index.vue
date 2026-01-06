<script lang="ts" setup>
import { AccessControl, useAccess } from '@vben/access';
import { useVbenModal } from '@vben/common-ui';

import { Button } from 'ant-design-vue';

//const { accessMode, hasAccessByCodes } = useAccess();

const [Modal, modalApi] = useVbenModal();
</script>

<template>
  <div>
    <!-- 需要指明 type="code" -->
    <AccessControl :codes="['sys:Menu:Create']" type="code">
      <Button type="primary"> Super 账号可见 ["AC_1000001"] </Button>
    </AccessControl>

    <Button type="primary" v-access:code="['admin']">
      aaaaa 账号可见 ["sys:Menu:Create"]
    </Button>

    <AccessControl :codes="['sys:Menu:Create']" type="code">
      <Button> Admin 账号可见 ["AC_100010"] </Button>
    </AccessControl>
    <AccessControl :codes="['sys:Menu:Create']" type="code">
      <Button> User 账号可见 ["AC_1000001"] </Button>
    </AccessControl>
    <AccessControl :codes="['sys:Menu:Create', 'AC_100010']" type="code">
      <Button
        type="primary"
        size="large"
        shape="round"
        :loading="{ delay: 1000 }"
        danger
      >
        Super & Admin 账号可见 ["AC_100100","AC_1000001"]
      </Button>
    </AccessControl>

    <Button @click="() => modalApi.open()">Open</Button>
    <Modal class="w-[600px]" title="基础示例"> modal content </Modal>
    <div class="p-5">aaa</div>
  </div>
</template>
