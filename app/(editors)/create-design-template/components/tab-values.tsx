import { TabsContent } from '@/components/ui/tabs'
import useCanvasStore from '../../_hooks/useCanvasStore'
import useDesignTemplateStore from '../../_hooks/useDesignTemplateStore'
import useDynamicValuesStore from '../../_hooks/useDynamicValuesStore'
import { Separator } from '@/components/ui/separator'
import ExampleTeamSection from './example-team-section'
import UserValuesSection from './user-values-section'
import TemplateColors from './template-colors'

interface TabValuesProps {
  designTemplateId?: string
}

export default function TabValues({ designTemplateId }: TabValuesProps) {
  useDynamicValuesStore()

  const { fabricCanvas } = useCanvasStore()
  useDesignTemplateStore()

  return (
    <>
      <div className='space-y-4 p-1'>
        <TemplateColors />
        <UserValuesSection />
        <Separator />
        {/* Example Team Section */}
        <ExampleTeamSection designTemplateId={designTemplateId} />
      </div>
    </>
  )
}
