import assert from 'node:assert/strict';

const base = process.env.TEST_BASE_URL || 'http://localhost:5186';
const idle = page => page.waitForFunction(() => document.querySelector('.character')?.dataset.state === 'idle');
const arrived = page => page.waitForFunction(() => document.querySelector('main')?.dataset.transitioning === 'false');
async function enter(page) {
  await page.getByRole('button', {name:'点击进入森林'}).click();
  await arrived(page);
}
async function drag(page, locator) {
  const box = await locator.boundingBox();
  const x = box.x + box.width / 2, y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 28, y + 18, {steps:8});
  await page.mouse.up();
}
export async function verifyInteractions(browser, results) {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({viewport:mobile ? {width:390,height:844} : {width:1440,height:900}, isMobile:mobile, hasTouch:mobile});
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => {if(m.type()==='error') errors.push(m.text());});
    await page.goto(base);
    await enter(page);
    await page.waitForTimeout(750);
    assert.equal(await page.locator('.character-hint').getAttribute('data-visible'), 'true', 'first discovery hint');
    await page.waitForFunction(()=>Number(getComputedStyle(document.querySelector('.character-hint')).opacity) > .5);
    const character = page.locator('.character'), mushroom = page.locator('.mushroom'), water = page.locator('.water-surface');
    await page.evaluate(() => {Math.random=()=>0;});
    await character.evaluate(el=>el.click());
    assert.equal(await page.evaluate(() => localStorage.getItem('forest3d.greeted')), 'true');
    await page.locator('.bulb').nth(3).evaluate(el=>el.click());
    await page.locator('.bulb').nth(3).evaluate(el=>el.click());
    await mushroom.evaluate(el=>el.click());
    assert.equal(await character.getAttribute('data-state'), 'wave', 'environment must not interrupt user');
    await page.waitForFunction(() => document.querySelector('.character').dataset.state === 'listen');
    await idle(page);
    await page.waitForTimeout(200);
    assert.equal(await character.getAttribute('data-state'),'idle','only latest queued environment action is played');
    assert.equal(await page.locator('.character-hint').getAttribute('data-visible'), 'false');
    await page.locator('.bulb').nth(3).evaluate(el=>el.click());
    await page.locator('.bulb').nth(3).evaluate(el=>el.click());
    await page.waitForFunction(()=>document.querySelector('.character').dataset.state==='lookUp');
    assert.equal(await character.getAttribute('data-state'),'lookUp');
    assert.equal(await character.getAttribute('data-pose'),'lookUp');
    await page.screenshot({path:'docs/screenshots/v0.3/'+(mobile?'mobile':'desktop')+'-look-up.png'});
    await character.evaluate(el=>el.click());
    assert.equal(await character.getAttribute('data-state'),'wave','user interrupts automatic reaction');
    await idle(page);
    await drag(page, character);
    assert.equal(await character.getAttribute('data-state'),'idle','dragging character does not tap');
    const lights = await page.locator('.bulb').nth(3).getAttribute('aria-pressed');
    await drag(page, page.locator('.bulb').nth(3));
    assert.equal(await page.locator('.bulb').nth(3).getAttribute('aria-pressed'),lights,'dragging lamp does not toggle');
    await drag(page, mushroom);
    assert.equal(await character.getAttribute('data-state'),'idle','dragging mushroom does not react');
    await mushroom.click();
    await page.waitForTimeout(350);
    assert(await page.locator('.mushroom-glow').evaluate(el=>Number(getComputedStyle(el).opacity))>.5);
    await page.screenshot({path:'docs/screenshots/v0.3/'+(mobile?'mobile':'desktop')+'-mushroom.png'});
    await idle(page);
    // Rapid taps preserve the newest three rings, even before animation cleanup.
    await water.evaluate(el => { for(let i=0;i<7;i++) el.click(); });
    assert.equal(await page.locator('.water-ripple').count(),3);
    await page.waitForTimeout(250);
    await page.screenshot({path:'docs/screenshots/v0.3/'+(mobile?'mobile':'desktop')+'-water.png'});
    await page.waitForTimeout(1600);
    assert.equal(await page.locator('.water-ripple').count(),0);
    await drag(page, water);
    assert.equal(await page.locator('.water-ripple').count(),0,'dragging water creates no ripple');
    if(mobile) {
      const cdp = await context.newCDPSession(page);
      const box = await mushroom.boundingBox(), x = box.x + box.width/2, y = box.y + box.height/2;
      await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
      // Send a human-paced gesture: one instantaneous move can be coalesced away.
      for(let step=1;step<=5;step++){
        await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+11*step,y:y+6*step}]});
        await page.waitForTimeout(30);
      }
      await page.waitForFunction(()=>Math.abs(Number(document.querySelector('main').style.getPropertyValue('--px')))>.05);
      await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
      assert.equal(await character.getAttribute('data-state'),'idle','real touch drag does not activate mushroom');
      await page.waitForTimeout(250);
      assert(Math.abs(await page.locator('main').evaluate(el=>Number(el.style.getPropertyValue('--px'))))>.05,'touch drag still moves scene');
      await cdp.detach();
    }
    // Queue a reaction then leave before it plays.
    await character.evaluate(el=>el.click());
    await mushroom.evaluate(el=>el.click());
    await page.getByRole('button',{name:'切换至萤火之森'}).click();
    await page.getByRole('heading',{name:'萤火之森'}).waitFor();
    await arrived(page);
    await page.waitForFunction(()=>document.querySelector('.character').dataset.state==='wave');
    await idle(page);
    await page.waitForTimeout(250);
    assert.equal(await character.getAttribute('data-state'),'idle','old queue cleared at transition');
    await page.getByRole('button',{name:'关闭音乐'}).click();
    await page.reload();
    await enter(page);
    await page.waitForTimeout(800);
    assert(await page.getByRole('button',{name:'打开音乐'}).isVisible(),'mute survives reload');
    assert.equal(await page.locator('.character-hint').getAttribute('data-visible'),'false','completed discovery survives reload');
    assert.deepEqual(errors,[]);
    results.push({interactionViewport:mobile?'390x844':'1440x900',checks:['discovery persistence','environment latest-only queue','user priority','lookUp sprite','mushroom glow','ripples capped at three','drag rejection on every hotspot','night greeting','queue cleared on transition','mute persistence','no console errors'],passed:true});
    await context.close();
  }

  const loading = await browser.newPage();
  let release;
  const held = new Promise(resolve=>{release=resolve;});
  await loading.route('**/forest-reference.webp', async route=>{await held;await route.continue();});
  await loading.goto(base,{waitUntil:'domcontentloaded'});
  assert(await loading.getByRole('button',{name:'森林正在苏醒…'}).isDisabled(),'core download gates entry');
  release();
  await enter(loading);
  await loading.close();
  results.push({corePreparationGate:true,passed:true});

  const retry = await browser.newPage();
  await retry.route('**/friend-reference.webp', route=>route.abort());
  await retry.goto(base);
  await retry.getByRole('button',{name:'重新准备森林'}).waitFor();
  assert.equal(await retry.getByRole('button',{name:'点击进入森林'}).count(),0);
  await retry.unroute('**/friend-reference.webp');
  await retry.getByRole('button',{name:'重新准备森林'}).click();
  await enter(retry);
  assert(await retry.locator('.pose-idle').evaluate(img=>img.complete && img.naturalWidth>0),'core retry restores visible sprite');
  await retry.close();
  results.push({coreFailureRetry:true,passed:true});

  const optional = await browser.newPage();
  await optional.route('**/friend-wave.webp', route=>route.abort());
  await optional.route('**/mushrooms.webp', route=>route.abort());
  await optional.addInitScript(() => {
    Object.defineProperty(Storage.prototype,'getItem',{value:()=>{throw new Error('Storage denied');}});
    Object.defineProperty(Storage.prototype,'setItem',{value:()=>{throw new Error('Storage denied');}});
    Object.defineProperty(window,'DeviceOrientationEvent',{value:{requestPermission:()=>Promise.reject(new Error('Denied'))}});
  });
  const optionalErrors = [];
  optional.on('pageerror', e=>optionalErrors.push(e.message));
  await optional.goto(base);
  await enter(optional);
  await optional.evaluate(()=>{Math.random=()=>0;});
  await optional.locator('.character').click();
  assert.equal(await optional.locator('.character').getAttribute('data-state'),'wave');
  assert.equal(await optional.locator('.character').getAttribute('data-pose'),'idle','failed optional pose uses idle');
  assert(await optional.locator('.mushroom').isDisabled(),'failed optional hotspot disabled');
  await optional.getByRole('button',{name:'关闭音乐'}).click();
  assert.deepEqual(optionalErrors,[]);
  await optional.close();
  results.push({optionalFailureStorageAndSensorDenied:true,passed:true});
}
