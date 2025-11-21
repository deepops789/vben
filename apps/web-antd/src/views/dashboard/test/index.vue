<script lang="ts" setup>
// import type { DemoTableApi } from '../mock-api';
import type { VxeGridProps } from '#/adapter/vxe-table';

// 添加isExpand状态变量声明
import { ref } from 'vue';

// import { MOCK_API_DATA } from './table-data';
import { useVbenDrawer } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Button, Popconfirm, Space } from 'ant-design-vue'; // 补充导入Icon组件

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getMenu } from '#/api/sys/menu';

import ExtraDrawerComp from './menudrawer.vue';
import BaseForm from './Form.vue';

const [Drawer, drawerApi] = useVbenDrawer({
  // onConfirm: onSubmit,
  // showConfirmButton: false,
  // showCancelButton:false,
  // 连接抽离的组件
  connectedComponent: BaseForm,
  destroyOnClose: true,
});

interface RowType {
  id: number;
  title: string;
  icon: string;
  path: null | string;
  is_frame: boolean;
  is_show: boolean;
  sort: null | number;
  permissions: RowType[]; // 子节点数组，递归使用当前类型适配树形结构
}

// 数据实例
// const MOCK_TREE_TABLE_DATA = [
//   {
//     date: '2020-08-01',
//     id: 10_000,
//     name: 'Test1',
//     parentId: null,
//     size: 1024,
//     type: 'mp3',
//   },
// ]

// const sleep = (time = 1000) => {
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve(true);
//     }, time);
//   });
// };

// 展开折叠

const isExpand = ref(false);

// 修改handleExpandAndCollapse方法实现
const handleExpandAndCollapse = () => {
  if (isExpand.value) {
    gridApi.grid.setAllTreeExpand(false);
    isExpand.value = false;
  } else {
    gridApi.grid.setAllTreeExpand(true);
    isExpand.value = true;
  }
};

// 在 rowConfig 中添加 useKey: true
const gridOptions: VxeGridProps<RowType> = {
  border: true,
  round: true,
  rowConfig: {
    isCurrent: true,
    isHover: true,
    useKey: true, // 添加缺少的 useKey 参数
  },
  columnConfig: {
    useKey: true,
  },
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { title: 'ID', type: 'seq', width: 50 },
    {
      field: 'title',
      title: '菜单名称',
      align: 'left',
      // indent: 20,
      treeNode: true,
      // formatter: ({ row }) => `${row.title ?? ''} (${row.name ?? ''})` // 处理undefined显示空字符串,此处处理层级变量名不一样情况作为参考
    },
    // {field: 'icon', title: '菜单图标', scopedSlots: { default: ({ row }) => <Icon type={row.icon} /> } }, // 使用导入的Icon组件
    {
      field: 'icon',
      title: '菜单图标',
      // type: 'html',
      align: 'center',
      width: 100,
      slots: { default: 'iconSlot' },
      // cellRender: { name: 'CellIcon' },
    },
    { field: 'path', title: '路由地址' },
    { field: 'component', title: 'component' },
    { field: 'sort', title: '排序', width: 88 },
    {
      field: 'operation',
      title: '操作',
      width: 160,
      align: 'center',
      slots: { default: 'operation' },
    },
  ],
  exportConfig: {},
  // pagerConfig: {
  //   pageSize: 10, // 设置默认每页显示10条
  //   pageSizes: [10, 20, 50] // 可选的每页显示数量
  // },
  // height: 'auto', // 如果设置为 auto，则必须确保存在父节点且不允许存在相邻元素，否则会出现高度闪动问题
  keepSource: true,
  treeConfig: {
    // 由于 rowId 不在 TreeConfig<RowType> 类型中，若 TreeConfig 有其他属性可替代，需根据实际情况修改
    // 这里暂时注释掉该属性，避免类型错误
    showLine: true,
    rowField: 'id', // 对应后端数据中节点的唯一标识字段（根据实际JSON调整，如为'menuId'则改为'menuId'）
    childrenField: 'permissions', // 对应后端数据中子节点数组的字段名（根据实际JSON调整，如为'children'则改为'children'）
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        try {
          return await getMenu(); // 移除分页参数
        } catch {
          return { items: [] }; // 简化错误处理
        }
      },
    },
  },
  toolbarConfig: {
    refresh: true,
    custom: true,
    // import: true,
    // export: true,
    // zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  gridOptions,
});

const handleModify = (id: string) => {
  console.log('=====modify', id);
};
</script>

<template>
  <div class="dashboard-test-container">
    <div class="vp-raw w-full">
      <Grid>
        <template #iconSlot="{ row }">
          <IconifyIcon
            :icon="row.icon"
            style="display: block; margin: 0 auto; font-size: 30px"
          />
        </template>
        <template #operation="{ row }">
          <Space size="small">
            <Button
              type="link"
              size="small"
              shape="round"
              @click="handleModify(row.id)"
            >
              修改
            </Button>
            <Popconfirm title="确定要删除吗？">
              <Button v-access:code="['AC_100100']" danger size="small">
                删除
              </Button>
            </Popconfirm>
          </Space>
        </template>
        <template #toolbar-actions>
          <Space size="large">
            <Button type="primary" @click="handleExpandAndCollapse()">
              {{ isExpand ? '折叠' : '展开' }}
            </Button>
          </Space>
        </template>
        <template #toolbar-tools>
          <Button
            type="primary"
            v-access:code="['sys:Menu:Create']"
            @click="drawerApi.open()"
          >
            新增菜单
          </Button>
          <Drawer />
        </template>
      </Grid>
    </div>
  </div>
</template>
