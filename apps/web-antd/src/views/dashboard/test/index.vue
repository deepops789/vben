<script lang="ts" setup>
// import type { DemoTableApi } from '../mock-api';
import type { VxeGridProps } from '#/adapter/vxe-table';

// 添加isExpand状态变量声明
import { ref, nextTick } from 'vue';

// import { MOCK_API_DATA } from './table-data';
import { useVbenDrawer, useVbenModal } from '@vben/common-ui';
import { IconifyIcon } from '@vben/icons';

import { Button, Popconfirm, Space, message } from 'ant-design-vue';
import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { getMenu,updateMenu,deleteMenu} from '#/api/sys/menu';


import ExtraDrawerComp from './menudrawer.vue';
import BaseForm from './Form.vue';
import ExtraModal from './MenuEditForm.vue';
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
  _X_ROW_KEY?: string | number;
  _X_ROW_ID?: string | number;
  _X_ROW_LEVEL?: number;
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

// // 修改handleExpandAndCollapse方法实现
// const handleExpandAndCollapse = () => {
//   if (isExpand.value) {
//     gridApi.grid.setAllTreeExpand(false);
//     isExpand.value = false;
//   } else {
//     gridApi.grid.setAllTreeExpand(true);
//     isExpand.value = true;
//   }
// };

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
    // transform: true, // 如果后端返回的数据已经是树形结构（有 permissions 子节点），则不需要 transform
    rowField: 'id', // 对应后端数据中节点的唯一标识字段（根据实际JSON调整，如为'menuId'则改为'menuId'）
    childrenField: 'permissions', // 对应后端数据中子节点数组的字段名（根据实际JSON调整，如为'children'则改为'children'）
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        try {
          const response = await getMenu(); // 移除分页参数
          // 调试日志：检查返回的数据结构
          console.log('getMenu response:', response);
          // 确保返回的数据格式正确
          if (response && typeof response === 'object') {
            // 如果返回的是数组，包装成 items
            if (Array.isArray(response)) {
              console.log('getMenu returned array, length:', response.length);
              // 检查第一个元素是否有 id
              if (response.length > 0) {
                console.log('First item:', response[0]);
                console.log('First item id:', response[0]?.id);
              }
              return { items: response };
            }
            // 如果已经有 items 字段，直接返回
            if (response.items) {
              console.log('getMenu returned object with items, length:', response.items.length);
              if (response.items.length > 0) {
                console.log('First item:', response.items[0]);
                console.log('First item id:', response.items[0]?.id);
              }
              return response;
            }
          }
          return { items: [] };
        } catch (error) {
          console.error('getMenu error:', error);
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
// 父组件：使用 connectedComponent 连接子组件 MenuEditForm.vue
// 子组件中也会调用 useVbenModal()，通过 inject 自动获取这里的 modalApi
// 注意：onOpenChange 事件会在父组件和子组件中都触发
const [Modal, modalApi] = useVbenModal({
  // 连接抽离的组件
  connectedComponent: ExtraModal,
  destroyOnClose: true,
  onOpenChange(isOpen: boolean) {
    // Modal 关闭后刷新表格并自动展开
    // 注意：这个 onOpenChange 和子组件中的 onOpenChange 都会触发
    if (!isOpen) {
      gridApi.query().then(() => {
        // 等待数据加载完成后，使用 nextTick 确保 DOM 更新后再展开
        nextTick(() => {
          gridApi.grid?.setAllTreeExpand(true);
          isExpand.value = true; // 同步展开状态
        });
      });
    }
  },
});

const isExpand = ref(false);
// 最简洁的实现
const handleExpandAndCollapse = () => {
  isExpand.value = !isExpand.value;
  gridApi.grid?.setAllTreeExpand(isExpand.value);
};
const handleModify = (row: RowType) => {
  const rowSeq = gridApi.grid?.getRowSeq?.(row);
  (row as any)._X_ROW_SEQ = rowSeq;
  

  // 使用 Modal 打开并传递数据
  modalApi.setData(row).open();
};

const handleDelete = async (row: RowType) => {
  console.log('=====delete', row);
  const rowSeq = gridApi.grid.getRowSeq(row);   
  (row as any)._X_ROW_SEQ = rowSeq;
    // 判断是否是最后层级：检查 row 中是否有 permissions 字段
  const isLeafNode = !row.id;
  
  if (isLeafNode) {
    const parentRow = gridApi.grid?.getTreeParentRow?.(row);
    if (parentRow) {
      (row as any).id = (parentRow as any).id;
    }
  }
  await deleteMenu(row);
    // 删除成功后提示并刷新表格
  message.success('删除成功');
  await gridApi.query();
  console.log('=====delete 发送完成');
  return true;
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
              v-access:code="['sys:Menu:Edit']"
              type="link"
              size="small"
              shape="round"
              @click="handleModify(row)"
            >
              修改
            </Button>
            <Popconfirm title="确定要删除吗？" @confirm="handleDelete(row)" >
              <Button v-access:code="['sys:Menu:Delete']" danger size="small">
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
          <Modal />
        </template>
      </Grid>
    </div>
  </div>
</template>
