// app/data/dailyEncouragements.ts
// Daily Encouragements - 2-line Rhyming Quotes (7 syllables each line)
// Edit this file to add, remove, or modify daily encouragements.

export interface DailyEncouragement {
  id: number;
  title: string;
  quote: string;
}

export const dailyEncouragements: DailyEncouragement[] = [
{ id: 1, title: "LEAN, DON'T SPIN", quote: "Lean on the Lord to steer,\nSpin on your own unclear." },
{ id: 2, title: "TRUST BEYOND SIGHT", quote: "When fear clouds out the way,\nTrust God and walk in faith." },
{ id: 3, title: "FAITH OVER FEELINGS", quote: "Feelings will fade and sway,\nGod's Word stands firm each day." },
{ id: 4, title: "HOLD FAST", quote: "When strength begins to fall,\nGod's love prevails through all." },
{ id: 5, title: "WAIT ON GOD", quote: "Don't rush ahead of God,\nHis timing shapes His will." },
{ id: 6, title: "GRACE IS ENOUGH", quote: "When trials dim your sight,\nHis grace will lift you up." },
{ id: 7, title: "STAND FIRM", quote: "When pressure stirs your doubt,\nStand firm and walk it out." },
{ id: 8, title: "PEACE BE STILL", quote: "When storms rise in your soul,\nChrist speaks and calms it all." },
{ id: 9, title: "WALK BY FAITH", quote: "Don't walk by what you see,\nTrust God who sets you free." },
{ id: 10, title: "REST IN HIM", quote: "Cease striving in the race,\nFind rest within His grace." },
{ id: 11, title: "HOPE ENDURES", quote: "When hope grows faint and thin,\nGod's faith stays strong within." },
{ id: 12, title: "FEAR NOT", quote: "Fear whispers loud and near,\nGod stays and kills the fear." },
{ id: 13, title: "STAY THE COURSE", quote: "The race is long and steep,\nFaith's runners still will keep." },
{ id: 14, title: "ANCHOR IN CHRIST", quote: "When doubts begin to rise,\nAnchor your soul in Christ." },
{ id: 15, title: "SURRENDER ALL", quote: "Release what fades away,\nFind peace in Christ today." },
{ id: 16, title: "PRESS ON", quote: "Don't let the past restrain,\nPress on through loss and pain." },
{ id: 17, title: "HIS LOVE REMAINS", quote: "The world's love fades and goes,\nGod's love forever flows." },
{ id: 18, title: "BE STILL", quote: "Be still and know He's God,\nHis ways are sure and broad." },
{ id: 19, title: "FIGHT THE GOOD FIGHT", quote: "When battles rage in sight,\nThe Lord will win your fight." },
{ id: 20, title: "EYES ON JESUS", quote: "When trials press you down,\nKeep eyes on Christ alone." },
{ id: 21, title: "TAKE COURAGE", quote: "Courage is faith in fear,\nTrust God when He is near." },
{ id: 22, title: "HIS WORD STANDS", quote: "Grass fades and flowers fall,\nGod's Word outlasts them all." },
{ id: 23, title: "HE IS FAITHFUL", quote: "When all around is sand,\nGod holds you in His hand." },
{ id: 24, title: "COME TO ME", quote: "When weary, worn, and tried,\nCome—Christ won't turn aside." },
{ id: 25, title: "SEEK FIRST", quote: "Don't chase the fading night,\nSeek God and find His light." },
{ id: 26, title: "TRUST THE PROCESS", quote: "When growth seems slow and small,\nGod works within it all." },
{ id: 27, title: "STAY THE COURSE", quote: "Don't quit before you're done,\nThe race is won when run." },
{ id: 28, title: "LOVE NEVER FAILS", quote: "No power can divide,\nHis love stays at your side." },
{ id: 29, title: "MERCY NEW", quote: "Each morning brings grace new,\nHis faith will carry you." },
{ id: 30, title: "PRAY WITHOUT CEASING", quote: "When strength and words are gone,\nLet simple prayers live on." },
];

export function getDailyEncouragement() {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today.getTime() - startOfYear.getTime()) / 86400000);
  const index = dayOfYear % dailyEncouragements.length;
  return dailyEncouragements[index];
}