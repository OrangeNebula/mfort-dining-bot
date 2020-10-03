import { Dining } from './dining.domain';

describe('Dining 도메인 클래스 테스트', () => {
  let dining: Dining;

  beforeEach(() => {
    dining = new Dining({
      id: 1,
      ts: '123.456',
    }, [
      { id: 1, name: '하오츠' },
      { id: 2, name: '하이 카오산' },
    ], [
      { user: '1' },
      { user: '2' },
      { user: '3' },
    ]);
  })

  test('새로운 Dining 생성시, 랜덤한 메뉴 선택된다.', () => {
    expect(dining.menu).toBeTruthy();
  });

  test('새로운 유저가 조인할 때 Participants 에 명단이 추가된다.', () => {
    dining.join({ user: '4' });
    expect(dining.participants).toEqual([
      { user: '1' },
      { user: '2' },
      { user: '3' },
      { user: '4' },
    ]);
  });

  test('유저가 취소를 할 때 Participants 에서 명단이 삭제된다.', () => {
    dining.out({ user: '3' });
    expect(dining.participants).toEqual([
      { user: '1' },
      { user: '2' },
    ]);
  })
})