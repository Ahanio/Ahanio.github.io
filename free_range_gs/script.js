const comparisonWidget = document.querySelector(".comparison-widget");

if (comparisonWidget) {
  const sliderStage = comparisonWidget.querySelector(".comparison-stage");
  const objaverseTabs = comparisonWidget.querySelector(".comparison-scenes-objaverse");
  const gsoTabs = comparisonWidget.querySelector(".comparison-scenes-gso");
  const inputImage = comparisonWidget.querySelector(".comparison-input-image");
  const gtImage = comparisonWidget.querySelector(".comparison-gt");
  const baseImage = comparisonWidget.querySelector(".comparison-base");
  const overlayImage = comparisonWidget.querySelector(".comparison-right .comparison-image");
  const rightLabel = comparisonWidget.querySelector('.viewer-label[data-side="right"]');
  const baselineButtons = [...comparisonWidget.querySelectorAll('.method-group[data-side="right"] .method-btn')];

  const methods = [
    { key: "reconviagen", label: "ReconViaGen" },
    { key: "lara", label: "LaRa" },
    { key: "gslrm", label: "GS-LRM" },
    { key: "lgm", label: "LGM" },
  ];

  const methodLabel = Object.fromEntries(methods.map((method) => [method.key, method.label]));
  const fallbackScenes = [
    { key: "5012891", label: "dragon" },
    { key: "5122907", label: "cockroach" },
    { key: "5042939", label: "logo" },
    { key: "5057770", label: "tree" },
    { key: "5037861", label: "frog" },
    { key: "5027735", label: "toroid" },
    { key: "5007696", label: "bucket" },
    { key: "5012882", label: "piece" },
    { key: "3D_Dollhouse_TablePurple", label: "table" },
    { key: "InterDesign_Over_Door", label: "hanger" },
    { key: "Down_To_Earth_Orchid_Pot_Ceramic_Lime", label: "pot" },
    { key: "Ortho_Forward_Facing_QCaor9ImJ2G", label: "bear" },
    { key: "TEA_SET", label: "tea set" },
    { key: "NUTS_BOLTS", label: "nuts bolts" },
    { key: "Dog", label: "dog" },
    { key: "3M_Vinyl_Tape_Green_1_x_36_yd", label: "tape" },
  ].map((scene) => ({
    ...scene,
    isObjaverse: /^\d+$/.test(scene.key),
  }));

  const state = {
    scene: "",
    right: "lara",
    split: Number(sliderStage.dataset.split || 50),
  };
  const defaultSceneKey = "3D_Dollhouse_TablePurple";

  const setSplit = (value) => {
    state.split = Math.min(100, Math.max(0, value));
    sliderStage.style.setProperty("--split", `${state.split.toFixed(2)}%`);
    sliderStage.dataset.split = state.split.toFixed(2);
  };

  const updateBaselineButtons = () => {
    for (const button of baselineButtons) {
      const isActive = button.dataset.method === state.right;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", String(isActive));
    }
  };

  const updateSceneButtons = () => {
    for (const button of comparisonWidget.querySelectorAll(".scene-tab")) {
      const isActive = button.dataset.scene === state.scene;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    }
  };

  const render = () => {
    inputImage.src = `./assets/slider-scenes/${state.scene}/input.png`;
    gtImage.src = `./assets/slider-scenes/${state.scene}/gt.png`;
    baseImage.src = `./assets/slider-scenes/${state.scene}/ours.png`;
    overlayImage.src = `./assets/slider-scenes/${state.scene}/${state.right}.png`;
    rightLabel.textContent = methodLabel[state.right];
    updateSceneButtons();
    updateBaselineButtons();
    setSplit(state.split);
  };

  const makeSceneTab = (scene, active) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = active ? "scene-tab is-active" : "scene-tab";
    button.dataset.scene = scene.key;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(active));
    button.textContent = scene.label;
    button.title = scene.label;
    return button;
  };

  const buildSceneRows = (scenes) => {
    objaverseTabs.innerHTML = "";
    gsoTabs.innerHTML = "";

    const objaverse = scenes.filter((scene) => scene.isObjaverse);
    const gso = scenes.filter((scene) => !scene.isObjaverse);
    const ordered = [...objaverse, ...gso];

    const hasDefault = ordered.some((scene) => scene.key === defaultSceneKey);
    state.scene = hasDefault ? defaultSceneKey : (ordered[0]?.key || fallbackScenes[0].key);

    for (const scene of objaverse) {
      objaverseTabs.appendChild(makeSceneTab(scene, scene.key === state.scene));
    }
    for (const scene of gso) {
      gsoTabs.appendChild(makeSceneTab(scene, scene.key === state.scene));
    }
  };

  const sceneClickHandler = (event) => {
    const button = event.target.closest(".scene-tab");
    if (!button) {
      return;
    }
    state.scene = button.dataset.scene;
    render();
  };

  objaverseTabs.addEventListener("click", sceneClickHandler);
  gsoTabs.addEventListener("click", sceneClickHandler);

  for (const button of baselineButtons) {
    button.addEventListener("click", () => {
      state.right = button.dataset.method;
      render();
    });
  }

  let dragging = false;

  const pointerToSplit = (clientX) => {
    const rect = sliderStage.getBoundingClientRect();
    const percent = ((clientX - rect.left) / rect.width) * 100;
    setSplit(percent);
  };

  sliderStage.addEventListener("pointerdown", (event) => {
    dragging = true;
    sliderStage.setPointerCapture(event.pointerId);
    pointerToSplit(event.clientX);
    event.preventDefault();
  });

  sliderStage.addEventListener("pointermove", (event) => {
    if (!dragging) {
      return;
    }
    pointerToSplit(event.clientX);
  });

  const stopDrag = (event) => {
    if (!dragging) {
      return;
    }
    dragging = false;
    if (sliderStage.hasPointerCapture(event.pointerId)) {
      sliderStage.releasePointerCapture(event.pointerId);
    }
  };

  sliderStage.addEventListener("pointerup", stopDrag);
  sliderStage.addEventListener("pointercancel", stopDrag);

  buildSceneRows(fallbackScenes);
  render();
}

const trellisWidget = document.querySelector(".trellis-widget");

if (trellisWidget) {
  const sceneTabs = trellisWidget.querySelector(".trellis-scenes-all");
  const inputImage = trellisWidget.querySelector(".trellis-input-image");
  const trellisImage = trellisWidget.querySelector(".trellis-pred-image");
  const oursImage = trellisWidget.querySelector(".trellis-ours-image");
  const gtImage = trellisWidget.querySelector(".trellis-gt-image");

  const fallbackScenes = [
    { key: "5077880", label: "monster" },
    { key: "Cole_Hardware_Mug_Classic_Blue", label: "mug" },
    { key: "5067823", label: "ball" },
    { key: "5032838", label: "post" },
    { key: "5022873", label: "lego girl" },
    { key: "ASSORTED_VEGETABLE_SET", label: "veg set" },
    { key: "CHICKEN_RACER", label: "chicken" },
    { key: "5037918", label: "lego fish" },
    { key: "BAGEL_WITH_CHEESE", label: "bagel" },
    { key: "5047918", label: "asset" },
    { key: "Circo_Fish_Toothbrush_Holder_14995988", label: "turtle toy" },
    { key: "5062863", label: "substance" },
    { key: "BABY_CAR", label: "baby car" },
    { key: "5057752", label: "antenna" },
    { key: "5082860", label: "demon" },
    { key: "Chelsea_BlkHeelPMP_DwxLtZNxLZZ", label: "heel" },
    { key: "5047942", label: "engine" },
    { key: "5077876", label: "G" },
    { key: "5062687", label: "pig" },
  ];

  const state = {
    scene: fallbackScenes[0].key,
  };

  const makeTab = (scene, active) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = active ? "trellis-tab is-active" : "trellis-tab";
    button.dataset.scene = scene.key;
    button.setAttribute("role", "tab");
    button.setAttribute("aria-selected", String(active));
    button.textContent = scene.label;
    button.title = scene.label;
    return button;
  };

  const updateTabs = () => {
    for (const button of trellisWidget.querySelectorAll(".trellis-tab")) {
      const isActive = button.dataset.scene === state.scene;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    }
  };

  const render = () => {
    inputImage.src = `./assets/trellis_compar/${state.scene}/input.png`;
    trellisImage.src = `./assets/trellis_compar/${state.scene}/trellis.png`;
    oursImage.src = `./assets/trellis_compar/${state.scene}/ours.png`;
    gtImage.src = `./assets/trellis_compar/${state.scene}/gt.png`;
    updateTabs();
  };

  const buildTabs = (scenes) => {
    sceneTabs.innerHTML = "";
    state.scene = scenes[0]?.key || fallbackScenes[0].key;
    for (const scene of scenes) {
      sceneTabs.appendChild(makeTab(scene, scene.key === state.scene));
    }
  };

  sceneTabs.addEventListener("click", (event) => {
    const button = event.target.closest(".trellis-tab");
    if (!button) {
      return;
    }
    state.scene = button.dataset.scene;
    render();
  });

  buildTabs(fallbackScenes);
  render();
}
