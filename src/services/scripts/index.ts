import { queryScripts, queryNode } from '../../database/scripts';

class ScriptService {
    /**
     * 剧本查询
     */
    getScripts(keyword?: string) {
        const scripts = queryScripts(keyword);
        return scripts.map(script => ({
            id: script.id,
            title: script.title,
            description: script.description,
            coverColor: script.cover_color,
            tags: JSON.parse(script.tags ?? '[]'),
            chapterCount: script.chapter_count,
            entryNodeId: script.entry_node_id,
        }));
    }

    /**
     * 查询单个剧本节点
     * 节点不存在时抛出错误，由 Controller 的 catch 统一返回 500
     */
    getNodes(scriptId: string, nodeId: string) {
        const node = queryNode(scriptId, nodeId);
        if (!node) {
            throw new Error(`节点不存在: ${scriptId}/${nodeId}`);
        }
        return {
            id: node.id,
            title: node.title,
            content: node.content,
            type: node.type,
            choices: JSON.parse(node.choices),
        };
    }
}

export default new ScriptService();