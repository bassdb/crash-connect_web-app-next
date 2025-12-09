'use client'
import useExampleTeamsStore from '@/app/(editors)/_hooks/useExampleTeamsStore'

export default function ExampleTeamDebug() {
  const { savedExampleTeamValues, previewedExampleTeamValues } = useExampleTeamsStore()
  const effectivePreviewTeam = previewedExampleTeamValues || savedExampleTeamValues

  return (
    <div className='px-3 py-1.5 rounded-md border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
      <div className='flex flex-col gap-1'>
        {/* Saved team (single line) */}
        <div className='flex items-center gap-2'>
          <span className='text-[10px] text-muted-foreground'>Saved:</span>
          {savedExampleTeamValues ? (
            <div className='flex items-center gap-2'>
              <div className='h-5 w-5 rounded-full overflow-hidden border bg-muted flex items-center justify-center'>
                {(savedExampleTeamValues as any).team_logo_url ||
                (savedExampleTeamValues as any).avatar_url ? (
                  <img
                    src={
                      (savedExampleTeamValues as any).team_logo_url ||
                      (savedExampleTeamValues as any).avatar_url
                    }
                    alt={savedExampleTeamValues.name}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <span className='text-[8px] font-medium'>
                    {savedExampleTeamValues.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <span className='text-[10px]'>{savedExampleTeamValues.name}</span>
              {(savedExampleTeamValues as any).colors &&
                Array.isArray((savedExampleTeamValues as any).colors) && (
                  <div className='flex gap-1'>
                    {(savedExampleTeamValues as any).colors
                      .slice(0, 5)
                      .map((c: any, idx: number) => (
                        <div
                          key={idx}
                          className='h-3 w-3 rounded-full border'
                          style={{ backgroundColor: c.value }}
                          title={`${c.name}: ${c.value}`}
                        />
                      ))}
                  </div>
                )}
            </div>
          ) : (
            <span className='text-[10px] italic text-muted-foreground'>none</span>
          )}
        </div>

        {/* Preview team (single line) */}
        <div className='flex items-center gap-2'>
          <span className='text-[10px] text-muted-foreground'>Preview:</span>
          {effectivePreviewTeam ? (
            <div className='flex items-center gap-2'>
              <div className='h-5 w-5 rounded-full overflow-hidden border bg-muted flex items-center justify-center'>
                {(effectivePreviewTeam as any).team_logo_url ||
                (effectivePreviewTeam as any).avatar_url ? (
                  <img
                    src={
                      (effectivePreviewTeam as any).team_logo_url ||
                      (effectivePreviewTeam as any).avatar_url
                    }
                    alt={effectivePreviewTeam.name}
                    className='h-full w-full object-cover'
                  />
                ) : (
                  <span className='text-[8px] font-medium'>
                    {effectivePreviewTeam.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                )}
              </div>
              <span className='text-[10px]'>{effectivePreviewTeam.name}</span>
              {effectivePreviewTeam.colors && Array.isArray(effectivePreviewTeam.colors) && (
                <div className='flex gap-1'>
                  {effectivePreviewTeam.colors.slice(0, 5).map((c: any, idx: number) => (
                    <div
                      key={idx}
                      className='h-3 w-3 rounded-full border'
                      style={{ backgroundColor: c.value }}
                      title={`${c.name}: ${c.value}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className='text-[10px] italic text-muted-foreground'>none</span>
          )}
        </div>
      </div>
    </div>
  )
}
