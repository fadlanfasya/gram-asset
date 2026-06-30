import { useState, useMemo, useCallback, useEffect } from 'react'
import { ReactFlow, Controls, Background, BackgroundVariant, MiniMap, useNodesState, useEdgesState, Handle, Position, useReactFlow } from '@xyflow/react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import '@xyflow/react/dist/style.css'
import useAssetStore from '../stores/useAssetStore'
import useDefinitionStore from '../stores/useDefinitionStore'
import useRelationshipStore from '../stores/useRelationshipStore'
import useThemeStore from '../stores/useThemeStore'
import './RelationshipsPage.css'

// Custom Node Component
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
            <Handle type="target" position={Position.Top} className="asset-handle" />
            <Handle type="source" position={Position.Bottom} className="asset-handle" />
        </div>
    )
}

const nodeTypes = {
    assetNode: AssetNode,
}

export default function RelationshipsPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const focusId = searchParams.get('focusId')
    const theme = useThemeStore((s) => s.theme)
    const isLight = theme === 'light'

    const assets = useAssetStore((s) => s.assets)
    const definitions = useDefinitionStore((s) => s.definitions)
    const relationships = useRelationshipStore((s) => s.relationships)

    // We manage the set of "visible" assets manually
    const [visibleAssetIds, setVisibleAssetIds] = useState(new Set())
    const [initialized, setInitialized] = useState(false)

    // React Flow state
    const [nodes, setNodes, onNodesChange] = useNodesState([])
    const [edges, setEdges, onEdgesChange] = useEdgesState([])

    // -- Helper: Get graph elements based on visibleAssetIds --
    const getGraphElements = useCallback((visibleIds) => {
        const newNodes = []
        const newEdges = []


        // 1. Create nodes for visible assets
        visibleIds.forEach(id => {
            const asset = assets.find(a => a.id === id)
            if (!asset) return

            const def = definitions.find(d => d.id === asset.definitionId)

            // Simple random positioning if new (React Flow handles changes gracefully usually)
            // or we can just let them stack and user drags them.
            // Ideally we use a dagre layout but for now let's position randomly around center if possible
            // or just deterministic hash-based grid

            const x = (id.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 10) * 150
            const y = (id.length * 50) + (Math.random() * 100)

            newNodes.push({
                id: asset.id,
                type: 'assetNode',
                position: { x, y }, // Initial position, user can move
                data: {
                    label: asset.name,
                    icon: def?.icon,
                    color: def?.color,
                    status: asset.status
                }
            })
        })

        // 2. Create edges ONLY if both source and target are visible
        relationships.forEach(rel => {
            if (visibleIds.has(rel.sourceId) && visibleIds.has(rel.targetId)) {
                newEdges.push({
                    id: rel.id,
                    source: rel.sourceId,
                    target: rel.targetId,
                    label: rel.type,
                    type: 'default',
                    animated: true,
                    style: { stroke: isLight ? '#94a3b8' : '#555', strokeWidth: 2 },
                })
            }
        })

        return { nodes: newNodes, edges: newEdges }
    }, [assets, definitions, relationships])

    // -- Initialization Logic --
    useEffect(() => {
        if (initialized || assets.length === 0) return

        const initialIds = new Set()

        if (focusId) {
            // Load focussed asset and its neighbors
            initialIds.add(focusId)
            relationships.forEach(r => {
                if (r.sourceId === focusId) initialIds.add(r.targetId)
                if (r.targetId === focusId) initialIds.add(r.sourceId)
            })
        } else {
            // Load top 3 most connected assets + their neighbors
            // 1. Count connections
            const counts = {}
            relationships.forEach(r => {
                counts[r.sourceId] = (counts[r.sourceId] || 0) + 1
                counts[r.targetId] = (counts[r.targetId] || 0) + 1
            })
            // 2. Sort
            const sortedIds = Object.keys(counts).sort((a, b) => counts[b] - counts[a])
            const top3 = sortedIds.slice(0, 3)

            top3.forEach(id => {
                initialIds.add(id)
                // Add neighbors of these top 3 too? Maybe just top 3 is cleaner
                relationships.forEach(r => {
                    if (r.sourceId === id) initialIds.add(r.targetId)
                    if (r.targetId === id) initialIds.add(r.sourceId)
                })
            })

            // If still empty (no rels), just add first 5 assets
            if (initialIds.size === 0) {
                assets.slice(0, 5).forEach(a => initialIds.add(a.id))
            }
        }

        setVisibleAssetIds(initialIds)

        // Apply initial graph
        const layout = getGraphElements(initialIds)
        setNodes(layout.nodes)
        setEdges(layout.edges)
        setInitialized(true)

    }, [initialized, assets, relationships, focusId, getGraphElements, setNodes, setEdges])


    // -- Interaction Handlers --

    const onNodeDoubleClick = useCallback((event, node) => {
        // Expand neighbors logic
        const clickedId = node.id
        const newIds = new Set(visibleAssetIds)

        // Find all neighbors
        relationships.forEach(r => {
            if (r.sourceId === clickedId) newIds.add(r.targetId)
            if (r.targetId === clickedId) newIds.add(r.sourceId)
        })

        if (newIds.size > visibleAssetIds.size) {
            setVisibleAssetIds(newIds)
            const layout = getGraphElements(newIds)
            // Merger logic: keep existing positions for existing nodes
            setNodes((prevNodes) => {
                const merged = [...prevNodes]
                layout.nodes.forEach(n => {
                    if (!merged.find(mn => mn.id === n.id)) {
                        // New node, place it near the clicked node (random offset)
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

    const handleAddFromSidebar = (assetId) => {
        if (!visibleAssetIds.has(assetId)) {
            const newIds = new Set(visibleAssetIds)
            newIds.add(assetId)
            setVisibleAssetIds(newIds)

            const layout = getGraphElements(newIds)
            setNodes(prev => {
                // Add new node at center-ish
                const newNode = layout.nodes.find(n => n.id === assetId)
                if (newNode) newNode.position = { x: 250, y: 250 }
                return [...prev, newNode]
            })
            // Update edges simply by replacing (or merging if we want to be fancy)
            // Replacing edges is usually fine as they auto-attach
            setEdges(layout.edges)
        }
    }

    // Sidebar Filtering
    const [search, setSearch] = useState('')
    // Show ALL assets in sidebar for searching
    const filteredAssets = assets.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))

    // Legend Data
    const uniqueDefinitions = [...new Set(assets.map(a => a.definitionId))]
        .map(id => definitions.find(d => d.id === id))
        .filter(Boolean)

    return (
        <div className="relationships-page">
            {/* Sidebar */}
            <div className="rel-sidebar">
                <div className="rel-header">
                    <div className="rel-title">
                        <span className="material-icons" style={{ color: 'var(--color-primary)' }}>hub</span>
                        GRAM InfrasMap
                    </div>
                    <div className="rel-subtitle">Double-click nodes to expand</div>
                </div>

                <div className="rel-search">
                    <div className="rel-search-input-wrapper">
                        <span className="material-icons rel-search-icon">search</span>
                        <input
                            type="text"
                            className="rel-search-input"
                            placeholder="Search to add node..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="rel-list">
                    {search ? (
                        /* Search Results Mode */
                        <div>
                            <div className="rel-list-header">Search Results</div>
                            {filteredAssets.map(asset => {
                                const def = definitions.find(d => d.id === asset.definitionId)
                                const isOnMap = visibleAssetIds.has(asset.id)
                                return (
                                    <div
                                        key={asset.id}
                                        className={`rel-item ${isOnMap ? 'rel-item--active' : ''}`}
                                        onClick={() => handleAddFromSidebar(asset.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="rel-node-row">
                                            <span className="material-icons text-sm" style={{ color: def?.color }}>
                                                {def?.icon || 'circle'}
                                            </span>
                                            <span>{asset.name}</span>
                                            {isOnMap && <span className="material-icons" style={{ marginLeft: 'auto', fontSize: 16 }}>check</span>}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        /* Default Relationship List Mode */
                        <div>
                            <div className="rel-list-header">
                                Active Links (Global)
                            </div>
                            {relationships.slice(0, 10).map(rel => {
                                // ... (keep usage of showing some recent relationships)
                                const source = assets.find(a => a.id === rel.sourceId)
                                const target = assets.find(a => a.id === rel.targetId)
                                const sourceDef = definitions.find(d => d.id === source?.definitionId)
                                const targetDef = definitions.find(d => d.id === target?.definitionId)
                                return (
                                    <div key={rel.id} className="rel-item">
                                        <span className="rel-type">{rel.type}</span>
                                        <div className="rel-node-row">
                                            <span className="material-icons text-sm" style={{ color: sourceDef?.color }}>{sourceDef?.icon}</span>
                                            <span>{source?.name}</span>
                                        </div>
                                        <div className="rel-arrow"><span className="material-icons rel-arrow-icon">arrow_downward</span></div>
                                        <div className="rel-node-row">
                                            <span className="material-icons text-sm" style={{ color: targetDef?.color }}>{targetDef?.icon}</span>
                                            <span>{target?.name}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Graph Area */}
            <div className="rel-graph-area">
                {/* Top Bar Overlay */}
                <div className="rel-top-bar">
                    <button
                        className="add-rel-btn"
                        onClick={() => navigate('/relationships/new')}
                    >
                        <span className="material-icons">add</span>
                        Add Relation
                    </button>
                </div>

                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onNodeDoubleClick={onNodeDoubleClick}
                    nodeTypes={nodeTypes}
                    fitView
                    attributionPosition="bottom-right"
                >
                    <Background
                        variant={BackgroundVariant.Dots}
                        gap={20}
                        size={1.2}
                        color={isLight ? '#94a3b8' : '#444'}
                    />
                    <Controls />
                    <MiniMap
                        nodeColor={(n) => n.data.color || '#fff'}
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                    />
                </ReactFlow>

                {/* Legend Overlay */}
                <div className="rel-legend">
                    <div className="legend-title">Asset Legend</div>
                    {uniqueDefinitions.map(def => (
                        <div key={def.id} className="legend-item">
                            <span className="legend-dot" style={{ background: def.color }}></span>
                            <span>{def.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
