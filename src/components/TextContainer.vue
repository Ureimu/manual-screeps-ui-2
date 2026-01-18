<script setup lang="ts">
interface Props {
    title?: string
    msg: Array<string | { label: string; value: string | number }>
}

withDefaults(defineProps<Props>(), {
    title: 'Information',
})

const formatMessage = (item: string | { label: string; value: string | number }): string => {
    if (typeof item === 'string') {
        return item
    }
    return `${item.label}: ${item.value}`
}
</script>

<template>
    <div class="text-container">
        <header class="container-header">
            <h3>{{ title }}</h3>
        </header>
        <main class="container-main">
            <div v-if="msg && msg.length > 0" class="info-list">
                <div v-for="(item, index) in msg" :key="index" class="info-item">
                    {{ formatMessage(item) }}
                </div>
            </div>
            <div v-else class="info-empty">
                <p>No information available</p>
            </div>
        </main>
    </div>
</template>

<style scoped>
.text-container {
    background: #ffffff;
    border-radius: 4px;
    padding: 1rem;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.container-header {
    margin: 0;
    padding-bottom: 0.75rem;
    border-bottom: 1px solid #e1e8ed;
    margin-bottom: 1rem;
}

.container-header h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 600;
    color: #333;
}

.container-main {
    padding: 0;
}

.info-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.info-item {
    font-size: 0.95rem;
    line-height: 1.6;
    color: #606266;
    word-break: break-word;
    padding: 0.25rem 0;
    font-family:
        -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif,
        'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
}

.info-item:hover {
    color: #303133;
    transition: color 0.3s ease;
}

.info-empty {
    padding: 1.5rem 0;
    text-align: center;
    color: #909399;
}

.info-empty p {
    margin: 0;
    font-size: 0.9rem;
}
</style>
