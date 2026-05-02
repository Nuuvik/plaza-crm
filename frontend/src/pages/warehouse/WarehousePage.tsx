import { Tabs } from 'antd'
import { useSearchParams } from 'react-router-dom'
import ComponentsTab from './ComponentsTab'
import ProductsTab from './ProductsTab'

const WarehousePage = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const tab = searchParams.get('tab') ?? 'products'

    const handleTabChange = (key: string) => {
        setSearchParams({ tab: key })
    }

    return (
        <div>
            <Tabs
                activeKey={tab}
                onChange={handleTabChange}
                items={[
                    { key: 'products', label: 'Готовая продукция' },
                    { key: 'components', label: 'Компоненты' },
                ]}
            />
            {tab === 'products' && <ProductsTab />}
            {tab === 'components' && <ComponentsTab />}
        </div>
    )
}

export default WarehousePage