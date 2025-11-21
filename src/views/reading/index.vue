<script setup>
import { ref } from 'vue'
// Import other UI components
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { useTextSelection } from '@vueuse/core'
import ExamLayout from '@/layouts/ExamLayout.vue'
const { text } = useTextSelection()
import {  Copy, Highlighter, Trash2Icon } from 'lucide-vue-next'
import {
  ContextMenu,
  ContextMenuCheckboxItem,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from '@/components/ui/context-menu'
// Watch for new text selection
const selection = ref(null)

function highlightSelectedText() {
  selection.value = window.getSelection()
  if (!selection.value || !selection.value.rangeCount) return

  const range = selection.value.getRangeAt(0)
  if (range.toString().trim() === '') return

  // Wrap in <mark>
  const mark = document.createElement('mark')
  mark.classList.add('highlight')
  try {
    range.surroundContents(mark)
  } catch (err) {
    console.warn('Highlight failed (probably multi-node selection):', err)
  }

  // Clear native selection (optional)
  selection.value.removeAllRanges()
}

const clearHighlightSelection = () => {
  // Remove all highlight marks
  const highlights = document.querySelectorAll('mark.highlight')
  highlights.forEach(mark => {
    const parent = mark.parentNode
    while (mark.firstChild) {
      parent.insertBefore(mark.firstChild, mark)
    }
    parent.removeChild(mark)
  })
  
  // Clear any active selection
  if (window.getSelection) {
    window.getSelection().removeAllRanges()
  } else if (document.selection) {
    document.selection.empty()
  }
  
}

// Reactive state for active part and question
const activePart = ref(1)
const activeQuestion = ref(0)

// Function to set active question
const setActiveQuestion = (part, questionIndex) => {
  activePart.value = part
  activeQuestion.value = questionIndex
}

// Function to get the global question number (1-40)
const getGlobalQuestionNumber = (part, questionIndex) => {
  switch (part) {
    case 1:
      return questionIndex + 1
    case 2:
      return questionIndex + 14
    case 3:
      return questionIndex + 27
    default:
      return questionIndex + 1
  }
}

// Function to get part and local index from global question number
const getPartAndIndex = (globalQuestionNumber) => {
  if (globalQuestionNumber <= 13) {
    return { part: 1, index: globalQuestionNumber - 1 }
  } else if (globalQuestionNumber <= 26) {
    return { part: 2, index: globalQuestionNumber - 14 }
  } else {
    return { part: 3, index: globalQuestionNumber - 27 }
  }
}

// Function to set active question by global number
const setActiveQuestionByGlobalNumber = (globalQuestionNumber) => {
  const { part, index } = getPartAndIndex(globalQuestionNumber)
  activePart.value = part
  activeQuestion.value = index
}

// Text selection actions
const copyText = async () => {
  if (text.value) {
    try {
      await navigator.clipboard.writeText(text.value)
    } catch (err) {
    }
  }
}

const highlightText = () => {
  if (text.value) {
    highlightSelectedText()
  }
}


</script>

<template>
  <ExamLayout title="Reading">
    <div class="min-w-0 flex-1 overflow-y-auto">
      <div class="h-full flex flex-col">
        <Card class="m-4 rounded-md shadow-none border px-4 py-3 bg-gray-100 dark:bg-[#1f2937] dark:border-[#1f2937]">
          <CardContent>
            <h2 class="text-lg font-semibold">Part 1</h2>
            <p>Read the text and answer questions 1-13.</p>
          </CardContent>
        </Card>

        <!----Main Content-->
        <ResizablePanelGroup id="handle-demo-group-1" direction="horizontal" class="flex flex-col h-full flex-1 w-full">
          <ResizablePanel id="handle-demo-panel-1" :default-size="50">
            <ContextMenu>
              <ContextMenuTrigger>
                <ScrollArea class="mx-auto w-full h-full max-w-6xl px-2 py-2 md:px-4 min-w-80">
                  <h2><strong>READING PASSAGE 2</strong></h2>
                  <p>You should spend about&nbsp;<strong>20&nbsp;</strong>minutes on Questions 14-26 which are based on
                    Reading Passage 2 below.</p>
                  <h3>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;</h3>
                  <h3 style="text-align: center;"><strong>Why do singers lose their voices?</strong></h3>
                  <p>&nbsp;</p>
                  <p><strong>A</strong>&nbsp;Singing is a tough business. Every vocal performance involves hundreds of
                    thousands of micro- collisions of a thin pair of muscular strips called the vocal cords, located in
                    the
                    larynx in the throat. When we are breathing in, they remain apart; when we sing or speak, air is
                    pushed
                    up out of the lungs, and the edges of the cords come together in a rapid chopping motion. The air
                    causes
                    the cords to vibrate, creating sound. The greater the vibration, the higher the pitch, and when a
                    soprano hits the highest notes her vocal cords are vibrating 1,000 times per second. This transforms
                    a
                    burst of air from her lungs into a sound powerful enough to shatter glass.</p>
                  <p>&nbsp;</p>
                  <p><strong>B</strong>&nbsp;Beautiful singing requires flexible cords, but the friction caused by
                    prolonged
                    overuse can erode their fine, spongy surface and lead to tiny bruises. Eventually, nodules, polyps
                    or
                    cysts form on the vocal folds, distorting the sound they create. For a singer, the first sign of
                    trouble
                    is often the 'wobble': the voice fluctuates on and off key because the damaged cords have lost the
                    ability to resonate properly. Often, there is a 'hole', a point on the musical scale where a
                    singer's
                    vibrating vocal cords fail to produce the proper tone. The sound produced will be flat, or worse
                    still,
                    barely audible.</p>
                  <p>&nbsp;</p>
                  <p><strong>C</strong>&nbsp;It was once unheard of for a singer to perform with a faulty voice.
                    However, in
                    recent times, it has become more common for performances to be interrupted, or even cancelled due to
                    the
                    inability of the performer to continue. Some opera singers complain of year-round cold symptoms, and
                    steroid injections and numerous other drugs are often used to get a struggling singer through a
                    performance. But continuing to sing can cause more damage and create voice- ruining scars, similar
                    to
                    when a football player continues to play with a damaged knee and eventually needs surgery.</p>
                  <p>There is no precise data on the number of performers who have undergone surgical procedures, but it
                    is
                    estimated that thousands have been under the knife. Dusty theatres, stuffy airplane cabins, erratic
                    eating and sleeping patterns and stress all affect the vocal cords. Add to all this the occupational
                    hazard - at least in opera and classical music of taking on roles that require artists to sing
                    beyond
                    their natural range, and a singer's cords become extremely susceptible to injury.</p>
                  <p>&nbsp;</p>
                  <p><strong>D</strong>&nbsp;Will Crutchfield, a conductor and vocal coach, laments the fact that this
                    vocal
                    burnout is cutting short careers and diminishing the power of opera, and he feels that audiences
                    have
                    become accustomed to hearing voices which are not in peak condition. When he first highlighted the
                    problem, he noticed that it didn't affect singers until they were in their 30s, but now even singers
                    in
                    their 20s are undergoing medical procedures to save their careers.</p>
                  <p>&nbsp;These injuries have been linked to a shift in what we consider quality singing. Across all
                    genres, it has become normal to believe that louder is better, and singers are pushing their vocal
                    cords
                    like never before. New waves of medical research into dysphonia, or the inability to properly
                    produce
                    sound, bear this out. In the western world, vocal abuse is surprisingly common in all professions
                    that
                    rely on the voice, from schoolteachers to opera singers.</p>
                  <p>&nbsp;</p>
                  <p><strong>E</strong>&nbsp;Steven Zeitels, a specialist vocal cord surgeon, believes that pioneering
                    surgery is the way forward. He is working on a futuristic solution which will involve implanting a
                    gel
                    made of biomaterial in the tissue of damaged vocal cords to restore pliability, and therefore the
                    voice.
                    However, some research studies argue that surgery is not necessarily a lasting fix. According to
                    Lisa
                    Paglin, a singer turned voice coach, Zeitels has simply found a temporary remedy. 'Unless a singer
                    makes
                    major changes, "return to performing" means a return to the vocal abuse that put him/her on the
                    operating table in the first place'. Her coaching partner Marianna Brilla agrees. 'You cannot solve
                    the
                    problem by simply relieving the symptom.'</p>
                  <p>One observation Paglin and Brilla have made from working with older, classically trained singers is
                    the
                    way that they use the natural up-down release of the diaphragm to produce sound, rather than relying
                    on
                    their vocal cords. For Brilla, this represents a real discovery: the root of the problem today is in
                    classrooms. She believes that students are graduating from music academies without having learned
                    this
                    natural singing method. In her opinion, today's students 'don't know how to sing, and it's leading
                    to
                    injury'.</p>
                  <p>&nbsp;</p>
                  <p><strong>F&nbsp;</strong>Is it possible that teaching people to sing differently could cure damaged
                    vocal cords forever? Zeitels is dismissive of such an approach, and quick to deny that his clients'
                    vocal problems are caused by bad technique. 'People used to think if you needed an operation it
                    meant
                    you don't know how to sing. The people I see they know how to sing!' Zeitels believes that medical
                    specialists are becoming increasingly important to the arts, given that any athletic endeavour will
                    eventually take a toll if done for long enough.</p>
                  <p>Robert Sataloff, who has performed voice-corrective surgery on several award-winning performers,
                    also
                    resens the notion that surgery is not a sensible way to keep singers healthy. He believes that
                    surgery,
                    combined with proper education on the dangers of improper singing technique, can keep people on
                    stage
                    for longer. He concedes that surgery is not a perfect solution, and it probably never will be, but
                    it is
                    an option.</p>
                  <p>&nbsp;</p>
                </ScrollArea>
              </ContextMenuTrigger>

              <ContextMenuContent>
                <ContextMenuItem @click="highlightText">
                  <Highlighter class="text-black dark:text-white" /> Highlight
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem @click="copyText">
                  <Copy class="text-black dark:text-white" /> Copy
                  <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem @click="clearHighlightSelection">
                  <Trash2Icon class="text-black dark:text-white"/> Clear All
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </ResizablePanel>
          <ResizableHandle id="handle-demo-handle-1" with-handle />
          <ResizablePanel id="handle-demo-panel-2" :default-size="50">
            <ContextMenu>
              <ContextMenuTrigger>
            <ScrollArea class="mx-auto w-full h-full max-w-6xl px-2 py-4 md:px-4 md:py-6 min-w-80">
              <div>
                <div class="mb-4 flex items-center justify-between">
                  <p class="text-lg font-bold">Questions 14 - 18</p>
                  <div><button class="flex items-center gap-1 hover:text-primary" type="button" aria-haspopup="dialog"
                      aria-expanded="false" aria-controls="radix-:r1t:" data-state="closed">Help</button></div>
                </div>
                <div class="ProseMirror">
                  <div class="mb-3">
                    <p>Reading Passage 2 has six sections,&nbsp;<strong>A&ndash;F</strong>.<br />Choose the correct
                      letter,&nbsp;<strong>A&ndash;F,</strong>&nbsp;in boxes 14&ndash;18 on your answer sheet.</p>
                  </div>
                </div>
                <div class="rounded-md bg-secondary px-4 py-6">
                  <div class="ProseMirror">
                    <p>examples of some of the environmental factors which affect singers&nbsp;</p>
                    <p>a reference to a lack of awareness of a correct singing technique&nbsp;</p>
                    <p>details of the physical processes involved when a person sings&nbsp;</p>
                    <p>a defence of the use of surgery to treat vocal injuries&nbsp;</p>
                    <p>a description of the initial indications of vocal problems&nbsp;</p>
                    <p>&nbsp;</p>
                    <p><strong>&nbsp;</strong></p>
                  </div>
                </div>
              </div>
              <div>
                <div class="mb-4 flex items-center justify-between">
                  <p class="text-lg font-bold">Questions 19 - 22</p>
                  <div><button class="flex items-center gap-1 hover:text-primary" type="button" aria-haspopup="dialog"
                      aria-expanded="false" aria-controls="radix-:r23:" data-state="closed">Help</button></div>
                </div>
                <div class="ProseMirror">
                  <div class="mb-3">
                    <p><em>Complete the sentences below.<br />Choose&nbsp;</em><strong><em>ONE WORD
                          ONLY</em></strong><em>&nbsp;from the passage for each answer.<br />Write your answers in
                        boxes 19&ndash;22 on your answer sheet.</em></p>
                  </div>
                </div>
                <div class="rounded-md bg-secondary px-4 py-6">
                  <div class="ProseMirror">
                    <p>The&nbsp;<input id="question-19"
                        class="h-5 max-w-[100px] rounded-[3px] bg-background px-1 text-center text-sm outline-none ring-primary/30 focus-visible:ring"
                        spellcheck="false" autocomplete="off" type="text" value="" placeholder="19" />&nbsp;of a
                      sound is determined by the rate of vibration of the vocal cords.</p>
                    <p>The delicate surface of the vocal cords can be worn down by&nbsp;<input id="question-20"
                        class="h-5 max-w-[100px] rounded-[3px] bg-background px-1 text-center text-sm outline-none ring-primary/30 focus-visible:ring"
                        spellcheck="false" autocomplete="off" type="text" value="" placeholder="20" />&nbsp;if they
                      are continually overused</p>
                    <p>Singers with vocal cord damage are often unable to produce a sound with the
                      correct&nbsp;<input id="question-21"
                        class="h-5 max-w-[100px] rounded-[3px] bg-background px-1 text-center text-sm outline-none ring-primary/30 focus-visible:ring"
                        spellcheck="false" autocomplete="off" type="text" value="" placeholder="21" />&nbsp;at a
                      certain point on the musical scale.</p>
                    <p>Opera singers are often given a variety of&nbsp;<input id="question-22"
                        class="h-5 max-w-[100px] rounded-[3px] bg-background px-1 text-center text-sm outline-none ring-primary/30 focus-visible:ring"
                        spellcheck="false" autocomplete="off" type="text" value="" placeholder="22" />&nbsp;to make
                      sure they can complete their performances.</p>
                  </div>
                </div>
              </div>
              <div>
                <div class="mb-4 flex items-center justify-between">
                  <p class="text-lg font-bold">Questions 23 - 26</p>
                  <div><button class="flex items-center gap-1 hover:text-primary" type="button" aria-haspopup="dialog"
                      aria-expanded="false" aria-controls="radix-:r24:" data-state="closed">Help</button></div>
                </div>
                <div class="ProseMirror">
                  <div class="mb-3">
                    <p><em>Look at the following statements (Questions 23&ndash;26) and the list of people
                        below.<br />Match each statement with the correct person,&nbsp;</em><strong><em>A, B,
                          C,</em></strong><em>&nbsp;or</em><strong><em>&nbsp;D.</em></strong></p>
                  </div>
                </div>
                <div class="rounded-md bg-secondary px-4 py-6">
                  <div class="ProseMirror">
                    <p>Surgery provides performers with only a short-term solution to their problems.&nbsp;</p>
                    <p>The public are now used to attending performances given by singers with vocal injuries.&nbsp;
                    </p>
                    <p>People are wrong to suggest that performers who undergo surgical procedures to repair their
                      voices lack singing ability.&nbsp;</p>
                    <p>Surgery works best when used in conjunction with re-training performers.&nbsp;</p>
                    <p>&nbsp;</p>
                    <table>
                      <colgroup>
                        <col />
                        <col />
                        <col />
                      </colgroup>
                      <tbody>
                        <tr>
                          <td colspan="1" rowspan="1">&nbsp;</td>
                          <td colspan="1" rowspan="1">
                            <p><strong>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; List of
                                People</strong><br /><strong>A</strong>&nbsp;Will
                              Crutchfield<br /><strong>B</strong>&nbsp;Steven
                              Zeitels<br /><strong>C</strong>&nbsp;Lisa Paglin<br /><strong>D</strong>&nbsp;Robert
                              Sataloff</p>
                            <p><strong>&nbsp;</strong></p>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </ScrollArea>
            </ContextMenuTrigger>

              <ContextMenuContent>
                <ContextMenuItem @click="highlightText">
                  <Highlighter class="text-black dark:text-white" /> Highlight
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem @click="copyText">
                  <Copy class="text-black dark:text-white" /> Copy
                  <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
                </ContextMenuItem>
                <ContextMenuSeparator />
                <ContextMenuItem @click="clearHighlightSelection">
                  <Trash2Icon class="text-black dark:text-white"/> Clear All
                </ContextMenuItem>
              </ContextMenuContent>
            </ContextMenu>
          </ResizablePanel>
        </ResizablePanelGroup>



        <!----Footer--->
        <div class="rounded-none border-t dark:border-t-gray-700 relative flex h-16 items-center justify-between space-x-4">
          
          <!-- Part 1 -->
          <div v-if="activePart === 1" class="flex h-full flex-1 items-center gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 1">
            <span class="font-bold">Part 1</span>
            <div class="flex gap-2" v-for="(i, index) in 13" :key="index">
              <div class="relative space-y-1">
                <div class="absolute bottom-full h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-800"></div>
                <Button :class="[
                  'cursor-pointer rounded-lg h-8 w-8',
                  activeQuestion === index && activePart === 1
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                ]" @click.stop="setActiveQuestion(1, index)">
                  {{ index + 1 }}
                </Button>
              </div>
            </div>
          </div>

          <div v-else class="flex h-full flex-1 items-center gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 1">
            <span class="font-bold">Part 1</span>
            <span class="text-gray-500">13 questions</span>
          </div>

          <!-- Part 2 -->
          <div v-if="activePart === 2" class="flex h-full flex-1 items-center gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 2">
            <span class="font-bold">Part 2</span>
            <div class="flex gap-2" v-for="(i, index) in 13" :key="index">
              <div class="relative space-y-1">
                <div class="absolute bottom-full h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-800"></div>
                <Button :class="[
                  'cursor-pointer rounded-lg h-8 w-8',
                  activeQuestion === index && activePart === 2
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                ]" @click.stop="setActiveQuestion(2, index)">
                  {{ index + 14 }}
                </Button>
              </div>
            </div>
          </div>

          <div v-else class="flex h-full flex-1 items-center gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 2">
            <span class="font-bold">Part 2</span>
            <span class="text-gray-500">13 questions</span>
          </div>

          <!-- Part 3 -->
          <div v-if="activePart === 3" class="flex h-full flex-1 items-center gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 3">
            <span class="font-bold">Part 3</span>
            <div class="flex gap-2" v-for="(i, index) in 14" :key="index">
              <div class="relative space-y-1">
                <div class="absolute bottom-full h-1 w-full rounded-sm bg-gray-200 dark:bg-gray-800"></div>
                <Button :class="[
                  'cursor-pointer rounded-lg h-8 w-8',
                  activeQuestion === index && activePart === 3
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                ]" @click.stop="setActiveQuestion(3, index)">
                  {{ index + 27 }}
                </Button>
              </div>
            </div>
          </div>

          <div v-else class="flex h-full flex-1 items-center gap-4 text-nowrap p-2 cursor-pointer"
            @click="activePart = 3">
            <span class="font-bold">Part 3</span>
            <span class="text-gray-500">14 questions</span>
          </div>
        </div>
      </div>
    </div>
  </ExamLayout>
</template>

<style scoped>
.highlight {
  background: yellow;
  color: black;
  padding: 2px;
  border-radius: 2px;
}
</style>