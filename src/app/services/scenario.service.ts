import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { Scenario } from '../models/scenario.model';

@Injectable({
  providedIn: 'root'
})
export class ScenarioService {
  private scenariosSubject = new BehaviorSubject<Scenario[]>([]);
  scenarios$ = this.scenariosSubject.asObservable();
  private jsonUrl = 'data/default_scenarios.json';
  private localStorageKey = 'cachedScenarios';

  constructor(private http: HttpClient) {
    this.loadScenarios();
  }

  private loadScenarios() {
    const cachedScenarios = localStorage.getItem(this.localStorageKey);
    if (cachedScenarios) {
      this.scenariosSubject.next(JSON.parse(cachedScenarios));
    } else {
      this.loadDefaultScenarios();
    }
  }

  private loadDefaultScenarios() {
    this.http.get<{ scenarios: Scenario[] }>(this.jsonUrl).pipe(
      map(response => response.scenarios),
      tap(scenarios => {
        this.scenariosSubject.next(scenarios);
        this.saveToLocalStorage(scenarios);
      }),
      catchError(error => {
        console.error('Error loading default scenarios', error);
        return of([]);
      })
    ).subscribe();
  }

  getScenarios(): Observable<Scenario[]> {
    return this.scenarios$;
  }

  addScenario(scenario: Scenario): Observable<Scenario> {
    const currentScenarios = this.scenariosSubject.value;
    const updatedScenarios = [...currentScenarios, scenario];
    this.updateScenarios(updatedScenarios);
    return of(scenario);
  }

  updateScenario(updatedScenario: Scenario): Observable<Scenario> {
    const currentScenarios = this.scenariosSubject.value;
    const updatedScenarios = currentScenarios.map(scenario => 
      scenario.name === updatedScenario.name ? updatedScenario : scenario
    );
    this.updateScenarios(updatedScenarios);
    return of(updatedScenario);
  }

  deleteScenario(name: string): Observable<void> {
    const currentScenarios = this.scenariosSubject.value;
    const updatedScenarios = currentScenarios.filter(scenario => scenario.name !== name);
    this.updateScenarios(updatedScenarios);
    return of(undefined);
  }

  private updateScenarios(scenarios: Scenario[]) {
    this.scenariosSubject.next(scenarios);
    this.saveToLocalStorage(scenarios);
  }

  private saveToLocalStorage(scenarios: Scenario[]) {
    localStorage.setItem(this.localStorageKey, JSON.stringify(scenarios));
  }

  loadDefaultScenariosManually(): Observable<Scenario[]> {
    return this.http.get<{ scenarios: Scenario[] }>(this.jsonUrl).pipe(
      map(response => response.scenarios),
      tap(scenarios => {
        this.scenariosSubject.next(scenarios);
        this.saveToLocalStorage(scenarios);
      }),
      catchError(error => {
        console.error('Error loading default scenarios', error);
        return of([]);
      })
    );
  }
}