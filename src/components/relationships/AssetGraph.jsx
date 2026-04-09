import { useState, useCallback, useEffect, useMemo } from 'react'
import { ReactFlow, Controls, Background, MiniMap, useNodesState, useEdgesState, Handle, Position } from '@xyflow/react'
import { useNavigate } from 'react-router-dom'
import '@xyflow/react/dist/style.css'
import useAssetStore from '../../stores/useAssetStore'
import useDefinitionStore from '../../stores/useDefinitionStore'
import useRelationshipStore from '../../stores/useRelationshipStore'
import './AssetGraph.css'

// Custom Node Component (Same as before)
const AssetNode = ({ data, selected }) => {
    return (
        <div className={`asset-node ${selected ? 'asset-node--selected' : ''}`}>
            <div
                className="asset-node__box"
                style={{ borderColor: selected ? '#fff' : data.color || '#3c83f6' }}
                title="Double-click to expand neighbors"
            >
                <span className="material-icons" style={{ color: data.color || '#3c83f6' }}>{data.icon || 'circle'}</span>
                <span
                    className="asset-node__status"
                    style={{ background: data.status === 'active' ? 'var(--color-green)' : 'var(--color-red)' }}
                ></span>
            </div>
            <div className="asset-node__label">{data.label}</div>
            <Handle type="target" position={Position.Top} style={{ background: '#555' }} />
            <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
        </div>
    )
}

const nodeTypes = {
    assetNode: AssetNode,
}

export default function AssetGraph({ focusId, className }) {
    const navigate = useNavigate()
    const assets = useAssetStore((s) => s.assets)
    const definitions = useDefinitionStore((s) => s.definitions)
    const relationships = useRelationshipStore((s) => s.relationships)

    // Determine initial visible set
    const [visibleAssetIds, setVisibleAssetIds] = useState(new Set())
    const [initialized, setInitialized] = useState(false)

    // React Flow state
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])

    // -- Helper: Get graph elements based on visibleAssetIds --
    const getGraphElements = useCallback((visibleIds) => {
        const newNodes = []
        const newEdges = []

        // 1. Create nodes
        visibleIds.forEach(id => {
            const asset = assets.find(a => a.id === id)
            if (!asset) return

            const def = definitions.find(d => d.id === asset.definitionId)

            // Deterministic positioning to keep it stable
            // If focusId is present, center it.
            let x = 0, y = 0

            if (id === focusId) {
                x = 0
                y = 0
            } else {
                // Random scatter around center
                const angle = (id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 360) * (Math.PI / 180)
                const radius = 250
                x = Math.cos(angle) * radius
                y = Math.sin(angle) * radius
            }

            newNodes.push({
                id: asset.id,
                type: 'assetNode',
                position: { x, y },
                data: {
                    label: asset.name,
                    icon: def?.icon,
                    color: def?.color,
                    status: asset.status
                }
            })
        })

        // 2. Create edges
        relationships.forEach(rel => {
            if (visibleIds.has(rel.sourceId) && visibleIds.has(rel.targetId)) {
                newEdges.push({
                    id: rel.id,
                    source: rel.sourceId,
                    target: rel.targetId,
                    label: rel.type,
                    type: 'default',
                    animated: true,
                    style: { stroke: '#555', strokeWidth: 2 },
                })
            }
        })

        return { nodes: newNodes, edges: newEdges }
    }, [assets, definitions, relationships, focusId])

    // -- Initialization --
    useEffect(() => {
        if (initialized || !focusId) return

        const initialIds = new Set()
        initialIds.add(focusId)

        // Add neighbor assets
        relationships.forEach(r => {
            if (r.sourceId === focusId) initialIds.add(r.targetId)
            if (r.targetId === focusId) initialIds.add(r.sourceId)
        })

        setVisibleAssetIds(initialIds)
        const layout = getGraphElements(initialIds)
        setNodes(layout.nodes)
        setEdges(layout.edges)
        setInitialized(true)
    }, [focusId, relationships, initialized, getGraphElements, setNodes, setEdges])

    // -- Interaction: Expand on Double Click --
    const onNodeDoubleClick = useCallback((event, node) => {
        const clickedId = node.id
        const newIds = new Set(visibleAssetIds)
        let added = false

        relationships.forEach(r => {
            if (r.sourceId === clickedId && !newIds.has(r.targetId)) { newIds.add(r.targetId); added = true; }
            if (r.targetId === clickedId && !newIds.has(r.sourceId)) { newIds.add(r.sourceId); added = true; }
        })

        if (added) {
            setVisibleAssetIds(newIds)
            const layout = getGraphElements(newIds)

            // Merge with existing nodes to preserve positions of old ones
            setNodes((prevNodes) => {
                const merged = [...prevNodes]
                layout.nodes.forEach(n => {
                    if (!merged.find(mn => mn.id === n.id)) {
                        // New node position relative to parent
                        const parent = prevNodes.find(p => p.id === clickedId)
                        if (parent) {
                            n.position = {
                                x: parent.position.x + (Math.random() - 0.5) * 200,
                                y: parent.position.y + (Math.random() - 0.5) * 200
                            }
                        }
                        merged.push(n)
                    }
                })
                return merged
            })
            setEdges(layout.edges)
        }
    }, [visibleAssetIds, relationships, getGraphElements, setNodes, setEdges])

    return (
        <div className={`asset-graph-container ${className || ''}`}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onNodeDoubleClick={onNodeDoubleClick}
                nodeTypes={nodeTypes}
                fitView
                minZoom={0.5}
                maxZoom={1.5}
            >
                <Background color="#333" gap={20} />
                <Controls />
                <MiniMap
                    nodeColor={(n) => n.data.color || '#fff'}
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                />
            </ReactFlow>

            {/* Simple Legend Overlay */}
            <div className="graph-overlay-actions">
                <button onClick={() => navigate('/relationships/new')} className="btn-add-rel-small">
                    <span className="material-icons">add_link</span> Add Link
                </button>
            </div>
        </div>
    )
}
