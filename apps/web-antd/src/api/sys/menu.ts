import { requestClient } from '#/api/request';

/**
 * 获取菜单数据（支持任意参数）
 * @param params 接口参数（类型不限）
 */
// import type { GetMenuParams } from '@vben/types';
/**
 * 菜单分页查询参数
 */
export interface GetMenuParams {
  page: number; // 当前页码（从1开始）
  pageSize: number; // 每页显示数量
  // 可选扩展字段（如搜索关键词）
  keyword?: string;
}
export interface CreateMenuParams {
  /** 菜单名称 */
  title: string;
  /** 菜单类型 */
  type: 'button' | 'menu' | 'permission';
  /** 路由地址 */
  path?: string;
  /** 图标名称 */
  icon?: string;
  /** 权限代码 */
  permissionCode?: string;
  /** 排序序号 */
  sortOrder?: number;
  /** 菜单状态 */
  status?: 0 | 1;
}

/**
 * 创建菜单API
 * @param params 菜单创建参数
 */
export async function createMenu(params: CreateMenuParams) {
  return requestClient.post('/system/createmenu/', { data: params });
}

export async function getMenu(params?: GetMenuParams) {
  return requestClient.get('/system/menu/', { params });
}
export async function getMenuList() {
  try {
    const response = await getMenu({ page: 1, pageSize: 1000 });
    // 根据实际API返回的数据结构调整
    if (response?.data?.list || response?.data) {
      const menus = response.data.list || response.data;
      return menus.map((menu: any) => ({
        label: menu.title || menu.name,
        value: menu.id,
      }));
    }
    return [];
  } catch (error) {
    console.error('获取菜单列表失败:', error);
    return [];
  }
}
