import { describe, expect, it } from 'vitest'

import { TOPIC_PARAM, topicFromSearch } from './contactTopic'

const topics = ['Kasa, POS albo terminal', 'Awaria albo serwis', 'KSeF i programy']

describe('topicFromSearch („Z czym dzwonisz?” → the topic chip of the form)', () => {
  it('picks the line’s topic named in `?temat=`, ignoring case and Polish letters', () => {
    expect(TOPIC_PARAM).toBe('temat')
    expect(topicFromSearch('?temat=awaria%20albo%20serwis', topics)).toBe('Awaria albo serwis')
    expect(topicFromSearch('?temat=KSEF+I+PROGRAMY', topics)).toBe('KSeF i programy')
  })

  it('ignores a topic the line does not have and an empty or missing parameter', () => {
    expect(topicFromSearch('?temat=Coś+innego', topics)).toBeNull()
    expect(topicFromSearch('?temat=', topics)).toBeNull()
    expect(topicFromSearch('', topics)).toBeNull()
  })
})
